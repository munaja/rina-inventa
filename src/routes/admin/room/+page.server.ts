import { fail } from '@sveltejs/kit';
import pool from '$lib/server/db.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PageServerLoad, Actions } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const search = url.searchParams.get('search') || '';
	const offset = (page - 1) * PAGE_SIZE;

	let whereClause = '';
	const params: (string | number)[] = [];
	if (search) {
		whereClause = 'WHERE r.name LIKE ? OR r.space LIKE ?';
		params.push(`%${search}%`, `%${search}%`);
	}

	const [countRows] = await pool.query<RowDataPacket[]>(
		`SELECT COUNT(*) as total FROM room r ${whereClause}`,
		params
	);
	const total = countRows[0].total;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const [rows] = await pool.query<RowDataPacket[]>(
		`SELECT r.*, b.description as buildingName
		 FROM room r
		 LEFT JOIN building b ON r.building_code = b.code
		 ${whereClause}
		 ORDER BY r.id DESC LIMIT ? OFFSET ?`,
		[...params, PAGE_SIZE, offset]
	);

	const [buildings] = await pool.execute<RowDataPacket[]>(
		'SELECT code, description FROM building WHERE code IS NOT NULL ORDER BY description'
	);

	return {
		items: rows as Record<string, unknown>[],
		buildings: buildings as { code: string; description: string }[],
		total,
		page,
		pageSize: PAGE_SIZE,
		totalPages,
		search
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const name = String(form.get('name') || '').trim();
		const space = String(form.get('space') || '').trim() || null;
		const buildingCode = String(form.get('building_code') || '').trim() || null;

		if (!name) return fail(400, { error: 'Nama ruangan wajib diisi' });

		await pool.execute<ResultSetHeader>(
			'INSERT INTO room (building_code, name, space) VALUES (?, ?, ?)',
			[buildingCode, name, space]
		);
		return { created: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		const name = String(form.get('name') || '').trim();
		const space = String(form.get('space') || '').trim() || null;
		const buildingCode = String(form.get('building_code') || '').trim() || null;

		if (!id || !name) return fail(400, { error: 'Data tidak lengkap' });

		await pool.execute('UPDATE room SET building_code = ?, name = ?, space = ? WHERE id = ?', [
			buildingCode,
			name,
			space,
			id
		]);
		return { updated: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'ID tidak valid' });

		await pool.execute('DELETE FROM room WHERE id = ?', [id]);
		return { deleted: true };
	}
};
