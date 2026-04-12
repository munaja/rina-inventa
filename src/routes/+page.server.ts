import pool from '$lib/server/db.js';
import type { RowDataPacket } from 'mysql2';
import type { PageServerLoad } from './$types';
import type { RoomSummary } from '$lib/types.js';

type StatBucket = { label: string; totalItem: number; totalValue: number };
type Stats = { condition?: StatBucket[]; category?: StatBucket[] };

export const load: PageServerLoad = async ({ url }) => {
	const inspectionDateParam = url.searchParams.get('inspection-date');

	const [dateRows] = await pool.execute<RowDataPacket[]>(
		'SELECT id, date FROM inspection ORDER BY date DESC'
	);
	const dates = dateRows.map((r) => ({
		id: r.id as number,
		date: String(r.date)
	}));

	const selectedDate = dates.find((d) => d.date === inspectionDateParam) || dates[0] || null;

	if (!selectedDate) {
		return { summaries: [] as RoomSummary[], dates, selectedDate: '' };
	}

	const [rows] = await pool.execute<RowDataPacket[]>(
		`SELECT ri.room_id as roomId, r.name as roomName,
		        ri.totalItem, ri.totalValue, ri.stats
		   FROM roomInspection ri
		   JOIN room r ON ri.room_id = r.id
		  WHERE ri.inspection_id = ?
		  ORDER BY r.name`,
		[selectedDate.id]
	);

	const summaries: RoomSummary[] = rows.map((r) => {
		const stats: Stats =
			typeof r.stats === 'string' ? JSON.parse(r.stats || '{}') : (r.stats ?? {});
		const conditions = stats.condition ?? [];
		const byLabel = (label: string) =>
			conditions.find((c) => c.label.toUpperCase() === label.toUpperCase());
		const baik = byLabel('Baik');
		const rusakRingan = byLabel('Rusak Ringan');
		const rusakBerat = byLabel('Rusak Berat');
		const categories = (stats.category ?? [])
			.map((c) => ({ label: c.label, count: c.totalItem, price: c.totalValue }))
			.sort((a, b) => b.count - a.count);

		return {
			roomId: r.roomId as number,
			roomName: r.roomName as string,
			totalCount: Number(r.totalItem) || 0,
			totalPrice: Number(r.totalValue) || 0,
			baikCount: baik?.totalItem ?? 0,
			baikPrice: baik?.totalValue ?? 0,
			rusakRinganCount: rusakRingan?.totalItem ?? 0,
			rusakRinganPrice: rusakRingan?.totalValue ?? 0,
			rusakBeratCount: rusakBerat?.totalItem ?? 0,
			rusakBeratPrice: rusakBerat?.totalValue ?? 0,
			categories
		};
	});

	return { summaries, dates, selectedDate: selectedDate.date };
};
