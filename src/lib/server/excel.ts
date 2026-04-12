import * as XLSX from 'xlsx';
import pool from './db.js';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { TableDef } from './table-config.js';
import { parseValue } from './parse-value.js';

export async function processExcelUpload(
	buffer: Buffer,
	tableDef: TableDef,
	sheetIndex?: number
): Promise<{ count: number }> {
	const workbook = XLSX.read(buffer, { type: 'buffer' });
	const sheetName = workbook.SheetNames[sheetIndex ?? 0];
	const sheet = workbook.Sheets[sheetName];
	const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

	// Find header row by scanning for a row that contains known Excel headers
	const knownHeaders = tableDef.columns
		.map((c) => c.excelHeader)
		.filter((h): h is string => !!h);

	let headerRowIndex = -1;
	for (let i = 0; i < Math.min(rawData.length, 20); i++) {
		const row = rawData[i];
		if (!Array.isArray(row)) continue;
		const rowStrs = row.map((c) => String(c ?? '').trim());
		const matchCount = knownHeaders.filter((h) => rowStrs.includes(h)).length;
		if (matchCount >= Math.min(3, knownHeaders.length)) {
			headerRowIndex = i;
			break;
		}
	}

	if (headerRowIndex === -1) {
		throw new Error('Header row not found in Excel file');
	}

	const headerRow = (rawData[headerRowIndex] as unknown[]).map((c) => String(c ?? '').trim());

	// Map Excel column index to DB column key
	const colMap: { excelIdx: number; dbKey: string }[] = [];
	for (const col of tableDef.columns) {
		if (!col.excelHeader) continue;
		const idx = headerRow.indexOf(col.excelHeader);
		if (idx !== -1) {
			colMap.push({ excelIdx: idx, dbKey: col.key });
		}
	}

	let count = 0;
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		for (let i = headerRowIndex + 1; i < rawData.length; i++) {
			const row = rawData[i];
			if (!Array.isArray(row) || row.length === 0) break;

			// Stop scanning as soon as the first column is empty.
			const firstCell = row[0];
			if (firstCell === null || firstCell === undefined || String(firstCell).trim() === '') break;

			const cols: string[] = [];
			const vals: (string | null)[] = [];
			const updates: string[] = [];

			for (const { excelIdx, dbKey } of colMap) {
				const raw = row[excelIdx];
				let val = raw !== null && raw !== undefined ? String(raw).trim() : null;
				// FK columns referencing land.code: treat "0" and "-" as missing.
				if (dbKey === 'land_code' && (val === '0' || val === '-')) val = null;
				cols.push(`\`${dbKey}\``);
				vals.push(val || null);
				updates.push(`\`${dbKey}\` = VALUES(\`${dbKey}\`)`);
			}

			if (cols.length === 0) continue;

			const placeholders = cols.map(() => '?').join(', ');
			const sql = `INSERT INTO \`${tableDef.table}\` (${cols.join(', ')}) VALUES (${placeholders})
				ON DUPLICATE KEY UPDATE ${updates.join(', ')}`;

			await conn.execute<ResultSetHeader>(sql, vals);
			count++;
		}

		await conn.commit();
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}

	return { count };
}

export async function processToolMachineInspectionUpload(
	buffer: Buffer,
	inspectionDate: string
): Promise<{ count: number }> {
	const workbook = XLSX.read(buffer, { type: 'buffer' });

	// Inspection uploads always target the "KIR" (Kartu Inventaris Ruangan)
	// sheet by name. Source workbooks like CVCU TATA.xlsx contain many hidden
	// "KIB*" tabs and selecting by index would read the wrong one. Building
	// code, room name, and room code live in the header rows; item rows start
	// at Excel row 15 (index 14).
	const sheet = workbook.Sheets['KIR'];
	if (!sheet) {
		throw new Error('Sheet "KIR" tidak ditemukan dalam file');
	}
	const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

	// Look up a labelled value like ["Kode Gedung", null, ": 11.01..."].
	// Returns the first non-null cell that follows the label cell, with any
	// leading ": " / ":" stripped.
	const findLabelValue = (label: string, maxRows = 15): string | null => {
		for (let i = 0; i < Math.min(rawData.length, maxRows); i++) {
			const row = rawData[i];
			if (!Array.isArray(row)) continue;
			const labelIdx = row.findIndex(
				(c) => c != null && String(c).trim() === label
			);
			if (labelIdx === -1) continue;
			for (let j = labelIdx + 1; j < row.length; j++) {
				const cell = row[j];
				if (cell == null) continue;
				const s = String(cell).trim();
				if (!s) continue;
				return s.replace(/^:\s*/, '').trim();
			}
		}
		return null;
	};

	// Header layout has two label/value groups on the same rows:
	//   Group 1 (col A label → col C value): "Kode Gedung", "Ruang", "Luas"
	//   Group 2 (col H label → col I value): "No. Kode Lokasi", "Unit Pemakai"
	// findLabelValue walks each row looking for the label, then takes the next
	// non-null cell — this handles both groups without needing fixed row/col.
	const buildingCode = findLabelValue('Kode Gedung');
	const roomName = findLabelValue('Ruang');
	const roomSpace = findLabelValue('Luas');
	const roomCode = findLabelValue('No. Kode Lokasi');

	if (!buildingCode) {
		throw new Error('"Kode Gedung" not found in sheet header');
	}
	if (!roomName) {
		throw new Error('"Ruang" not found in sheet header');
	}

	// KIR column layout is positional. Columns C (2) and D (3) hold the code
	// pieces; the rest of the descriptive fields follow a fixed layout.
	const KODE_COL = 2;
	const REG_COL = 3;

	// Map inspection table fields to KIR column indices.
	//   A(0) No.   B(1) Jenis Barang/Nama Barang  C(2) Kode Barang  D(3) Register
	//   E(4) Merk/Model  F(5) No. Seri Pabrik  G(6) Ukuran  H(7) Bahan
	//   I(8) Tahun  J(9) Jumlah  K(10) Harga  L(11) Keadaan  M(12) Keterangan
	const fieldMap: Record<string, number> = {
		description: 1,
		brandType: 4,
		factoryNumber: 5,
		sizeCC: 6,
		material: 7,
		currentValue: 10,
		condition: 11,
		remarks: 12
	};

	// Fields that are also present on the referenced `toolMachine` row. If the
	// inspection value matches the master value, we store NULL and rely on the
	// FK join at read time — avoiding duplicated data. `currentValue` is
	// intentionally absent: it is the inspection-time valuation and has no
	// master counterpart.
	const masterMirroredFields = [
		'bookDate',
		'acquisitionDate',
		'description',
		'brandType',
		'sizeCC',
		'material',
		'color',
		'factoryNumber',
		'frameNumber',
		'engineNumber',
		'policeNumber',
		'vehicleRegNumber'
	] as const;

	// Data rows start at Excel row 15, i.e. zero-indexed 14.
	const DATA_START_INDEX = 14;

	let count = 0;
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		// Upsert the inspection session row by date. The `LAST_INSERT_ID(id)`
		// trick makes MySQL return the existing row's id on conflict, so a single
		// round trip gives us "insert or reuse" without a separate SELECT.
		const [inspResult] = await conn.execute<ResultSetHeader>(
			'INSERT INTO inspection (date) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
			[inspectionDate]
		);
		const inspectionId = inspResult.insertId;

		// Verify the referenced building exists so the FK insert below will
		// succeed, and produce a clearer error if it doesn't.
		const [buildingRows] = await conn.execute<import('mysql2').RowDataPacket[]>(
			'SELECT code FROM building WHERE code = ? LIMIT 1',
			[buildingCode]
		);
		if (buildingRows.length === 0) {
			throw new Error(`Gedung dengan kode "${buildingCode}" belum ada. Upload data master gedung terlebih dahulu.`);
		}

		// Find-or-create the room. Prefer lookup by unique `code` if the sheet
		// provided one ("No. Kode Lokasi"); fall back to (building_code, name)
		// which is also uniquely keyed.
		let roomId: number;
		let existingRoom: import('mysql2').RowDataPacket[] = [];
		if (roomCode) {
			const [rows] = await conn.execute<import('mysql2').RowDataPacket[]>(
				'SELECT id FROM room WHERE code = ?',
				[roomCode]
			);
			existingRoom = rows;
		}
		if (existingRoom.length === 0) {
			const [rows] = await conn.execute<import('mysql2').RowDataPacket[]>(
				'SELECT id FROM room WHERE building_code = ? AND name = ?',
				[buildingCode, roomName]
			);
			existingRoom = rows;
		}
		if (existingRoom.length > 0) {
			roomId = existingRoom[0].id;
			await conn.execute(
				'UPDATE room SET code = COALESCE(?, code), building_code = ?, name = ?, space = COALESCE(?, space) WHERE id = ?',
				[roomCode, buildingCode, roomName, roomSpace, roomId]
			);
		} else {
			const [result] = await conn.execute<ResultSetHeader>(
				'INSERT INTO room (code, building_code, name, space) VALUES (?, ?, ?, ?)',
				[roomCode, buildingCode, roomName, roomSpace]
			);
			roomId = result.insertId;
		}

		// "Replace" semantics for re-uploads: any prior rows for this
		// (inspection, room) pair are dropped before the new set is inserted.
		await conn.execute(
			'DELETE FROM toolMachineInspection WHERE inspection_id = ? AND room_id = ?',
			[inspectionId, roomId]
		);

		for (let i = DATA_START_INDEX; i < rawData.length; i++) {
			const row = rawData[i];
			if (!Array.isArray(row)) break;

			// Stop scanning as soon as the first column is empty.
			const firstCell = row[0];
			if (firstCell === null || firstCell === undefined || String(firstCell).trim() === '') break;

			// The inspection FK is built by joining column C ("Kode Barang") with
			// column D ("Register") padded to 6 digits — e.g. "11.01.35....048" + "8"
			// → "11.01.35....048.000008". This must equal an existing toolMachine.code.
			const kodeRaw = row[KODE_COL];
			const kode = kodeRaw != null ? String(kodeRaw).trim() : '';
			if (!kode || !kode.includes('.')) continue;

			const regRaw = row[REG_COL];
			const reg = regRaw != null ? String(regRaw).trim() : '';
			if (!reg) continue;

			const code = `${kode}.${reg.padStart(6, '0')}`;

			// Collect raw values from the sheet first.
			const rowValues: Record<string, string | null> = {};
			for (const [field, idx] of Object.entries(fieldMap)) {
				const raw = row[idx];
				let val = raw != null ? String(raw).trim() : null;
				if (val && field === 'description') {
					val = val.replace(/\[.*?\]\s*/g, '').trim();
				}
				rowValues[field] = val || null;
			}

			// Fetch the referenced toolMachine row (if any) so we can null out
			// columns whose values already match the master record.
			const [masterRows] = await conn.execute<import('mysql2').RowDataPacket[]>(
				'SELECT * FROM toolMachine WHERE code = ? LIMIT 1',
				[code]
			);
			const master = masterRows[0];
			if (master) {
				for (const field of masterMirroredFields) {
					if (!(field in rowValues)) continue;
					const masterVal =
						master[field] != null && master[field] !== '' ? String(master[field]).trim() : null;
					if (rowValues[field] === masterVal) {
						rowValues[field] = null;
					}
				}
			}

			const cols: string[] = ['`inspection_id`', '`toolMachine_code`', '`room_id`'];
			const vals: (string | number | null)[] = [inspectionId, code, roomId];

			for (const [field, val] of Object.entries(rowValues)) {
				cols.push(`\`${field}\``);
				vals.push(val);
			}

			const placeholders = cols.map(() => '?').join(', ');
			await conn.execute<ResultSetHeader>(
				`INSERT INTO toolMachineInspection (${cols.join(', ')}) VALUES (${placeholders})`,
				vals
			);
			count++;
		}

		await recomputeRoomInspection(conn, inspectionId, roomId);

		await conn.commit();
	} catch (e) {
		await conn.rollback();
		throw e;
	} finally {
		conn.release();
	}

	return { count };
}

type StatBucket = { label: string; totalItem: number; totalValue: number };

async function recomputeRoomInspection(
	conn: PoolConnection,
	inspectionId: number,
	roomId: number
): Promise<void> {
	const [rows] = await conn.execute<RowDataPacket[]>(
		'SELECT currentValue, `condition`, description FROM toolMachineInspection WHERE inspection_id = ? AND room_id = ?',
		[inspectionId, roomId]
	);

	let totalItem = 0;
	let totalValue = 0;
	const condMap = new Map<string, StatBucket>();
	const catMap = new Map<string, StatBucket>();

	const bump = (map: Map<string, StatBucket>, rawLabel: unknown, value: number) => {
		const label = rawLabel != null && String(rawLabel).trim() !== '' ? String(rawLabel).trim() : '-';
		const bucket = map.get(label) ?? { label, totalItem: 0, totalValue: 0 };
		bucket.totalItem += 1;
		bucket.totalValue += value;
		map.set(label, bucket);
	};

	for (const row of rows) {
		const value = parseValue(row.currentValue);
		totalItem += 1;
		totalValue += value;
		bump(condMap, row.condition, value);
		bump(catMap, row.description, value);
	}

	const stats = {
		condition: [...condMap.values()],
		category: [...catMap.values()]
	};

	await conn.execute(
		`INSERT INTO roomInspection (inspection_id, room_id, totalItem, totalValue, stats)
		 VALUES (?, ?, ?, ?, ?)
		 ON DUPLICATE KEY UPDATE
		   totalItem = VALUES(totalItem),
		   totalValue = VALUES(totalValue),
		   stats = VALUES(stats)`,
		[inspectionId, roomId, totalItem, totalValue, JSON.stringify(stats)]
	);
}
