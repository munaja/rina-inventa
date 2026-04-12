import { fail } from '@sveltejs/kit';
import pool from '$lib/server/db.js';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { PageServerLoad, Actions } from './$types';
import { processToolMachineInspectionUpload } from '$lib/server/excel.js';

const PAGE_SIZE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
	const search = url.searchParams.get('search') || '';
	const roomId = url.searchParams.get('room-id') || '';
	const condition = url.searchParams.get('condition') || '';
	const inspectionDate = url.searchParams.get('inspection_date') || '';
	const offset = (page - 1) * PAGE_SIZE;

	let whereClause = '';
	const conditions: string[] = [];
	const params: (string | number)[] = [];

	if (search) {
		conditions.push('(t.toolMachine_code LIKE ? OR t.description LIKE ? OR t.brandType LIKE ?)');
		params.push(`%${search}%`, `%${search}%`, `%${search}%`);
	}
	if (roomId) {
		conditions.push('t.room_id = ?');
		params.push(roomId);
	}
	if (condition) {
		conditions.push('t.`condition` = ?');
		params.push(condition);
	}
	if (inspectionDate) {
		conditions.push('DATE(i.date) = ?');
		params.push(inspectionDate);
	}
	if (conditions.length > 0) {
		whereClause = `WHERE ${conditions.join(' AND ')}`;
	}

	const [countRows] = await pool.query<RowDataPacket[]>(
		`SELECT COUNT(*) as total FROM toolMachineInspection t
		 LEFT JOIN inspection i ON t.inspection_id = i.id
		 ${whereClause}`,
		params
	);
	const total = countRows[0].total;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	const [rows] = await pool.query<RowDataPacket[]>(
		`SELECT t.*, r.name as roomName, r.space as roomSpace,
		        i.date as inspectionDate, tm.description as toolMachineName
		 FROM toolMachineInspection t
		 LEFT JOIN room r ON t.room_id = r.id
		 LEFT JOIN inspection i ON t.inspection_id = i.id
		 LEFT JOIN toolMachine tm ON t.toolMachine_code = tm.code
		 ${whereClause}
		 ORDER BY t.id DESC LIMIT ? OFFSET ?`,
		[...params, PAGE_SIZE, offset]
	);

	const [rooms] = await pool.execute<RowDataPacket[]>('SELECT id, name FROM room ORDER BY name');
	const [dateRows] = await pool.execute<RowDataPacket[]>(
		'SELECT DISTINCT DATE(i.date) as date FROM inspection i ORDER BY date DESC'
	);
	const dates = dateRows.map((r) => String(r.date).split(' ')[0]);

	return {
		items: rows as Record<string, unknown>[],
		rooms: rooms as { id: number; name: string }[],
		dates,
		total,
		page,
		pageSize: PAGE_SIZE,
		totalPages,
		search,
		roomId,
		condition,
		inspectionDate
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const cols: string[] = [];
		const vals: (string | number | null)[] = [];
		const fields = [
			'inspection_id', 'room_id', 'toolMachine_code', 'bookDate', 'acquisitionDate', 'acquisitionValue',
			'description', 'brandType', 'sizeCC', 'material', 'color', 'factoryNumber',
			'frameNumber', 'engineNumber', 'policeNumber', 'vehicleRegNumber', 'condition', 'remarks'
		];

		for (const field of fields) {
			const val = form.get(field);
			if (val !== null && val !== '') {
				cols.push(`\`${field}\``);
				vals.push(String(val));
			}
		}

		if (cols.length === 0) return fail(400, { error: 'Data tidak lengkap' });

		const placeholders = cols.map(() => '?').join(', ');
		await pool.execute<ResultSetHeader>(
			`INSERT INTO toolMachineInspection (${cols.join(', ')}) VALUES (${placeholders})`,
			vals
		);
		return { created: true };
	},

	update: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'ID tidak valid' });

		const fields = [
			'inspection_id', 'room_id', 'toolMachine_code', 'bookDate', 'acquisitionDate', 'acquisitionValue',
			'description', 'brandType', 'sizeCC', 'material', 'color', 'factoryNumber',
			'frameNumber', 'engineNumber', 'policeNumber', 'vehicleRegNumber', 'condition', 'remarks'
		];
		const sets: string[] = [];
		const vals: (string | number | null)[] = [];

		for (const field of fields) {
			const val = form.get(field);
			sets.push(`\`${field}\` = ?`);
			vals.push(val !== null && val !== '' ? String(val) : null);
		}

		vals.push(id);
		await pool.execute(`UPDATE toolMachineInspection SET ${sets.join(', ')} WHERE id = ?`, vals);
		return { updated: true };
	},

	delete: async ({ request }) => {
		const form = await request.formData();
		const id = Number(form.get('id'));
		if (!id) return fail(400, { error: 'ID tidak valid' });
		await pool.execute('DELETE FROM toolMachineInspection WHERE id = ?', [id]);
		return { deleted: true };
	},

	upload: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const inspectionDate = String(formData.get('inspectionDate') ?? '').trim();

		if (!file || file.size === 0) {
			return fail(400, { error: 'File wajib diupload' });
		}
		if (!/^\d{4}-\d{2}-\d{2}$/.test(inspectionDate)) {
			return fail(400, { error: 'Tanggal inspeksi wajib diisi' });
		}

		try {
			const buffer = Buffer.from(await file.arrayBuffer());
			const result = await processToolMachineInspectionUpload(buffer, inspectionDate);
			return { uploaded: true, uploadCount: result.count };
		} catch (e: unknown) {
			return fail(400, { error: `Gagal mengupload: ${(e as Error).message}` });
		}
	}
};
