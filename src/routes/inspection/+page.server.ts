import pool from '$lib/server/db.js';
import type { RowDataPacket } from 'mysql2';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const roomId = url.searchParams.get('room_id') || '';
	const condition = url.searchParams.get('kondisi') || '';
	const inspectionDate = url.searchParams.get('inspection_date') || '';
	const search = url.searchParams.get('search') || '';
	const offset = (page - 1) * PAGE_SIZE;

	const [rooms] = await pool.execute<RowDataPacket[]>('SELECT id, name FROM room ORDER BY name');
	const [dateRows] = await pool.execute<RowDataPacket[]>(
		'SELECT DISTINCT i.date FROM inspection i ORDER BY i.date DESC'
	);
	const dates = dateRows.map((r) => String(r.date).split(' ')[0]);

	const conditions: string[] = [];
	const params: (string | number)[] = [];

	if (inspectionDate) {
		conditions.push('DATE(i.date) = ?');
		params.push(inspectionDate);
	}
	if (roomId) {
		conditions.push('t.room_id = ?');
		params.push(Number(roomId));
	}
	if (condition) {
		conditions.push('t.`condition` = ?');
		params.push(condition);
	}
	if (search) {
		conditions.push('(tm.description LIKE ? OR t.description LIKE ?)');
		params.push(`%${search}%`, `%${search}%`);
	}

	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

	const [countRows] = await pool.query<RowDataPacket[]>(
		`SELECT COUNT(*) as total
		 FROM toolMachineInspection t
		 LEFT JOIN inspection i ON t.inspection_id = i.id
		 LEFT JOIN toolMachine tm ON t.toolMachine_code = tm.code
		 ${whereClause}`,
		params
	);
	const total = Number(countRows[0].total);
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const [rows] = await pool.query<RowDataPacket[]>(
		`SELECT t.*, r.name as roomName, DATE(i.date) as inspectionDate,
		        tm.description as toolMachineName
		 FROM toolMachineInspection t
		 LEFT JOIN room r ON t.room_id = r.id
		 LEFT JOIN inspection i ON t.inspection_id = i.id
		 LEFT JOIN toolMachine tm ON t.toolMachine_code = tm.code
		 ${whereClause}
		 ORDER BY i.date DESC, r.name, t.description
		 LIMIT ? OFFSET ?`,
		[...params, PAGE_SIZE, offset]
	);

	return {
		items: rows as Record<string, unknown>[],
		rooms: rooms as { id: number; name: string }[],
		dates,
		total,
		page,
		totalPages,
		filters: {
			room_id: roomId,
			kondisi: condition,
			inspection_date: inspectionDate,
			search
		}
	};
};
