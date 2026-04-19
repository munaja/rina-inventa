import type { PageServerLoad } from './$types';
import pool from '$lib/server/db.js';
import type { RowDataPacket } from 'mysql2';

const SOURCE_TABLES = [
	'toolMachine',
	'toolSoftware',
	'building',
	'room',
	'permanentAsset',
	'road',
	'extraAsset',
	'otherAsset',
	'land'
] as const;

export const load: PageServerLoad = async () => {
	const entries = await Promise.all(
		SOURCE_TABLES.map(async (table) => {
			const [rows] = await pool.query<RowDataPacket[]>(
				`SELECT COUNT(*) as total FROM \`${table}\``
			);
			return [table, Number(rows[0].total)] as const;
		})
	);
	const counts = Object.fromEntries(entries) as Record<(typeof SOURCE_TABLES)[number], number>;
	return { counts };
};
