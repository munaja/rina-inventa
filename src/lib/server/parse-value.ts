export function parseValue(v: unknown): number {
	if (v === null || v === undefined || v === '') return 0;
	const s = String(v)
		.replace(/[^\d.,-]/g, '')
		.replace(/\./g, '')
		.replace(',', '.');
	return Number(s) || 0;
}
