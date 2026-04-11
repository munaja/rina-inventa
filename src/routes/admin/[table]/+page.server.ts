import { fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { TABLE_DEFS, SLUG_TO_TABLE, SLUG_TO_EXCEL } from '$lib/server/table-config.js';
import { loadTableData, createRecord, updateRecord, deleteRecord } from '$lib/server/crud.js';
import { processExcelUpload } from '$lib/server/excel.js';
import path from 'path';
import { readFile } from 'fs/promises';

export const load: PageServerLoad = async ({ params, url }) => {
	const tableKey = SLUG_TO_TABLE[params.table];
	if (!tableKey) throw error(404, 'Table not found');

	const tableDef = TABLE_DEFS[tableKey];
	if (!tableDef) throw error(404, 'Table not found');

	const data = await loadTableData(tableDef, url.searchParams);
	return {
		...data,
		tableDef,
		slug: params.table
	};
};

export const actions: Actions = {
	create: async ({ request, params }) => {
		const tableKey = SLUG_TO_TABLE[params.table];
		if (!tableKey) return fail(400, { error: 'Invalid table' });
		const tableDef = TABLE_DEFS[tableKey];

		const formData = await request.formData();
		try {
			await createRecord(tableDef, formData);
			return { created: true };
		} catch (e: unknown) {
			return fail(400, { error: `Gagal membuat data: ${(e as Error).message}` });
		}
	},

	update: async ({ request, params }) => {
		const tableKey = SLUG_TO_TABLE[params.table];
		if (!tableKey) return fail(400, { error: 'Invalid table' });
		const tableDef = TABLE_DEFS[tableKey];

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'ID tidak valid' });

		try {
			await updateRecord(tableDef, id, formData);
			return { updated: true };
		} catch (e: unknown) {
			return fail(400, { error: `Gagal memperbarui data: ${(e as Error).message}` });
		}
	},

	delete: async ({ request, params }) => {
		const tableKey = SLUG_TO_TABLE[params.table];
		if (!tableKey) return fail(400, { error: 'Invalid table' });
		const tableDef = TABLE_DEFS[tableKey];

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400, { error: 'ID tidak valid' });

		try {
			await deleteRecord(tableDef.table, id);
			return { deleted: true };
		} catch (e: unknown) {
			return fail(400, { error: `Gagal menghapus data: ${(e as Error).message}` });
		}
	},

	upload: async ({ request, params }) => {
		const tableKey = SLUG_TO_TABLE[params.table];
		if (!tableKey) return fail(400, { error: 'Invalid table' });
		const tableDef = TABLE_DEFS[tableKey];
		const excelFile = SLUG_TO_EXCEL[params.table];

		const formData = await request.formData();
		const file = formData.get('file') as File | null;

		let buffer: Buffer;
		if (file && file.size > 0) {
			buffer = Buffer.from(await file.arrayBuffer());
		} else if (excelFile) {
			const filePath = path.resolve('resources', excelFile);
			try {
				buffer = await readFile(filePath);
			} catch {
				return fail(400, { error: `File sumber tidak ditemukan: ${excelFile}` });
			}
		} else {
			return fail(400, { error: 'Tidak ada file untuk diupload' });
		}

		try {
			const result = await processExcelUpload(buffer, tableDef);
			return { uploaded: true, uploadCount: result.count };
		} catch (e: unknown) {
			return fail(400, { error: `Gagal mengupload: ${(e as Error).message}` });
		}
	}
};
