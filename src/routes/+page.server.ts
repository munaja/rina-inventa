import pool from '$lib/server/db.js';
import type { RowDataPacket } from 'mysql2';
import type { PageServerLoad } from './$types';
import type { RoomSummary } from '$lib/types.js';

export const load: PageServerLoad = async ({ url }) => {
	const inspectionDateParam = url.searchParams.get('inspection-date');

	// Get available inspection dates from the inspection table
	const [dateRows] = await pool.execute<RowDataPacket[]>(
		'SELECT id, date FROM inspection ORDER BY date DESC'
	);
	const dates = dateRows.map((r) => ({
		id: r.id as number,
		date: String(r.date).split('T')[0].split(' ')[0]
	}));

	const selectedDate = dates.find((d) => d.date === inspectionDateParam) || dates[0] || null;

	// Parse acquisitionValue string to number
	const parseValue = (v: unknown): number => {
		if (v === null || v === undefined || v === '') return 0;
		const s = String(v).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.');
		return Number(s) || 0;
	};

	// Build query: filter by inspection_id if available, otherwise show all
	const hasInspectionFilter = selectedDate !== null;
	const query = `SELECT
			r.id as roomId,
			r.name as roomName,
			COUNT(*) as totalCount,
			SUM(CASE WHEN t.\`condition\` = 'Baik' THEN 1 ELSE 0 END) as baikCount,
			SUM(CASE WHEN t.\`condition\` = 'Rusak Ringan' THEN 1 ELSE 0 END) as rusakRinganCount,
			SUM(CASE WHEN t.\`condition\` = 'Rusak Berat' THEN 1 ELSE 0 END) as rusakBeratCount,
			GROUP_CONCAT(COALESCE(t.acquisitionValue, '0') SEPARATOR '||') as allValues,
			GROUP_CONCAT(CONCAT(COALESCE(t.\`condition\`, ''), ':', COALESCE(t.acquisitionValue, '0')) SEPARATOR '||') as conditionValues
		 FROM toolMachineInspection t
		 JOIN room r ON t.room_id = r.id
		 ${hasInspectionFilter ? 'WHERE t.inspection_id = ?' : ''}
		 GROUP BY r.id, r.name
		 ORDER BY r.name`;

	const [rows] = hasInspectionFilter
		? await pool.execute<RowDataPacket[]>(query, [selectedDate.id])
		: await pool.execute<RowDataPacket[]>(query);

	const summaries: RoomSummary[] = rows.map((r) => {
		const allVals = String(r.allValues || '').split('||');
		const condVals = String(r.conditionValues || '').split('||');
		let totalPrice = 0;
		let baikPrice = 0;
		let rusakRinganPrice = 0;
		let rusakBeratPrice = 0;

		for (const v of allVals) totalPrice += parseValue(v);
		for (const cv of condVals) {
			const [cond, val] = cv.split(':');
			const p = parseValue(val);
			const c = cond.toUpperCase();
			if (c === 'BAIK') baikPrice += p;
			else if (c === 'RUSAK RINGAN') rusakRinganPrice += p;
			else if (c === 'RUSAK BERAT') rusakBeratPrice += p;
		}

		return {
			roomId: r.roomId as number,
			roomName: r.roomName as string,
			totalCount: Number(r.totalCount),
			totalPrice,
			baikCount: Number(r.baikCount),
			baikPrice,
			rusakRinganCount: Number(r.rusakRinganCount),
			rusakRinganPrice,
			rusakBeratCount: Number(r.rusakBeratCount),
			rusakBeratPrice
		};
	});

	return { summaries, dates, selectedDate: selectedDate?.date ?? '' };
};
