import { fail } from '@sveltejs/kit';
import pool from '$lib/server/db.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PageServerLoad, Actions } from './$types';
import { hashPassword } from '$lib/server/auth.js';

export const load: PageServerLoad = async () => {
	const [rows] = await pool.execute<RowDataPacket[]>(
		'SELECT id, username, role, createdAt FROM `user` ORDER BY id'
	);
	return { users: rows as { id: number; username: string; role: string; createdAt: string }[] };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const username = String(form.get('username') || '').trim();
		const password = String(form.get('password') || '');
		const role = String(form.get('role') || 'operator');

		if (!username || !password) return fail(400, { error: 'Username dan password wajib diisi' });
		if (password.length < 6) return fail(400, { error: 'Password minimal 6 karakter' });

		const [existing] = await pool.execute<RowDataPacket[]>(
			'SELECT id FROM `user` WHERE username = ?',
			[username]
		);
		if (existing.length > 0) return fail(400, { error: 'Username sudah ada' });

		const hashed = await hashPassword(password);
		await pool.execute<ResultSetHeader>(
			'INSERT INTO `user` (username, password, role) VALUES (?, ?, ?)',
			[username, hashed, role]
		);
		return { created: true };
	},

	resetPassword: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const password = String(form.get('password') || '');
		if (!id || !password) return fail(400, { error: 'Data tidak lengkap' });
		if (password.length < 6) return fail(400, { error: 'Password minimal 6 karakter' });

		const hashed = await hashPassword(password);
		await pool.execute('UPDATE `user` SET password = ? WHERE id = ?', [hashed, id]);
		return { passwordReset: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'ID tidak valid' });
		await pool.execute('DELETE FROM `user` WHERE id = ?', [id]);
		return { deleted: true };
	}
};
