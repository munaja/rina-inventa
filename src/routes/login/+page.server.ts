import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import pool from '$lib/server/db.js';
import { verifyPassword, createSession, destroySession } from '$lib/server/auth.js';
import type { RowDataPacket } from 'mysql2';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		throw redirect(303, '/admin');
	}
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = String(formData.get('username') || '').trim();
		const password = String(formData.get('password') || '');

		if (!username || !password) {
			return fail(400, { error: 'Username dan password wajib diisi', username });
		}

		const [rows] = await pool.execute<RowDataPacket[]>(
			'SELECT id, username, password, role FROM `user` WHERE username = ?',
			[username]
		);

		if (rows.length === 0) {
			return fail(400, { error: 'Username atau password salah', username });
		}

		const user = rows[0];
		const valid = await verifyPassword(password, user.password);
		if (!valid) {
			return fail(400, { error: 'Username atau password salah', username });
		}

		const token = await createSession(user.id);
		cookies.set('session', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7
		});

		throw redirect(303, '/admin');
	},

	logout: async ({ cookies }) => {
		const token = cookies.get('session');
		if (token) {
			await destroySession(token);
			cookies.delete('session', { path: '/' });
		}
		throw redirect(303, '/');
	}
};
