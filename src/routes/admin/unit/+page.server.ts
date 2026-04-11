import { fail } from '@sveltejs/kit';
import pool from '$lib/server/db.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const [rows] = await pool.execute<RowDataPacket[]>(
		'SELECT * FROM unit ORDER BY name'
	);
	return { units: rows as { id: number; code: string; name: string }[] };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const code = String(form.get('code') || '').trim();
		const name = String(form.get('name') || '').trim();
		if (!code || !name) return fail(400, { error: 'Kode dan nama wajib diisi' });

		const [existing] = await pool.execute<RowDataPacket[]>('SELECT id FROM unit WHERE code = ?', [code]);
		if (existing.length > 0) return fail(400, { error: 'Kode unit sudah ada' });

		await pool.execute<ResultSetHeader>('INSERT INTO unit (code, name) VALUES (?, ?)', [code, name]);
		return { created: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const code = String(form.get('code') || '').trim();
		const name = String(form.get('name') || '').trim();
		if (!id || !code || !name) return fail(400, { error: 'Data tidak lengkap' });

		await pool.execute('UPDATE unit SET code = ?, name = ? WHERE id = ?', [code, name, id]);
		return { updated: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'ID tidak valid' });
		await pool.execute('DELETE FROM unit WHERE id = ?', [id]);
		return { deleted: true };
	}
};
