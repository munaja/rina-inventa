import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TABLE_DEFS, SLUG_TO_TABLE } from '$lib/server/table-config.js';
import { loadTableData } from '$lib/server/crud.js';

// Only expose "source" tables publicly
const SOURCE_SLUGS = new Set([
	'tool-machine',
	'tool-software',
	'building',
	'permanent-asset',
	'road',
	'extra-asset',
	'other-asset',
	'land'
]);

export const load: PageServerLoad = async ({ params, url }) => {
	if (!SOURCE_SLUGS.has(params.table)) throw error(404, 'Not found');

	const tableKey = SLUG_TO_TABLE[params.table];
	if (!tableKey) throw error(404, 'Not found');

	const tableDef = TABLE_DEFS[tableKey];
	if (!tableDef) throw error(404, 'Not found');

	const data = await loadTableData(tableDef, url.searchParams);
	return {
		...data,
		tableDef,
		slug: params.table
	};
};
