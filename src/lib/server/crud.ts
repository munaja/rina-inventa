import pool from './db.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { TableDef } from './table-config.js';

const PAGE_SIZE = 20;

export async function loadTableData(
	tableDef: TableDef,
	searchParams: URLSearchParams
): Promise<{
	items: Record<string, unknown>[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	search: string;
}> {
	const page = Math.max(1, Number(searchParams.get('page')) || 1);
	const search = searchParams.get('search') || '';
	const offset = (page - 1) * PAGE_SIZE;

	let whereClause = '';
	const params: (string | number | null)[] = [];

	if (search) {
		const searchCols = tableDef.columns
			.filter((c) => ['code', 'description', 'name', 'brandType', 'refCode', 'title'].includes(c.key))
			.map((c) => `\`${c.key}\` LIKE ?`);
		if (searchCols.length > 0) {
			whereClause = `WHERE (${searchCols.join(' OR ')})`;
			for (let i = 0; i < searchCols.length; i++) {
				params.push(`%${search}%`);
			}
		}
	}

	const [countRows] = await pool.query<RowDataPacket[]>(
		`SELECT COUNT(*) as total FROM \`${tableDef.table}\` ${whereClause}`,
		params
	);
	const total = countRows[0].total;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const [rows] = await pool.query<RowDataPacket[]>(
		`SELECT * FROM \`${tableDef.table}\` ${whereClause} ORDER BY id DESC LIMIT ? OFFSET ?`,
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
}

export async function createRecord(
	tableDef: TableDef,
	formData: FormData
): Promise<{ id: number }> {
	const cols: string[] = [];
	const vals: (string | number | null)[] = [];
	const placeholders: string[] = [];

	for (const col of tableDef.columns) {
		const val = formData.get(col.key);
		if (val !== null && val !== '') {
			cols.push(`\`${col.key}\``);
			vals.push(String(val));
			placeholders.push('?');
		}
	}

	const [result] = await pool.execute<ResultSetHeader>(
		`INSERT INTO \`${tableDef.table}\` (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`,
		vals
	);
	return { id: result.insertId };
}

export async function updateRecord(
	tableDef: TableDef,
	id: number,
	formData: FormData
): Promise<void> {
	const sets: string[] = [];
	const vals: (string | number | null)[] = [];

	for (const col of tableDef.columns) {
		const val = formData.get(col.key);
		sets.push(`\`${col.key}\` = ?`);
		vals.push(val !== null && val !== '' ? String(val) : null);
	}

	vals.push(id);
	await pool.execute(
		`UPDATE \`${tableDef.table}\` SET ${sets.join(', ')} WHERE id = ?`,
		vals
	);
}

export async function deleteRecord(tableName: string, id: number): Promise<void> {
	await pool.execute(`DELETE FROM \`${tableName}\` WHERE id = ?`, [id]);
}
