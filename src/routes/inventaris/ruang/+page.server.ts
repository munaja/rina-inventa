import pool from '$lib/server/db.js';
import type { RowDataPacket } from 'mysql2';
import type { PageServerLoad } from './$types';

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

	return {
		items: rows as Record<string, unknown>[],
		total,
		page,
		pageSize: PAGE_SIZE,
		totalPages,
		search
	};
};
