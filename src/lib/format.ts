export function formatRupiah(n: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0
	}).format(n);
}

export function formatCompact(n: number): string {
	if (n >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(1)}M`;
	if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}jt`;
	if (n >= 1_000) return `Rp${(n / 1_000).toFixed(1)}rb`;
	return `Rp${n}`;
}

/** True if the value looks like a number (digits with optional thousands/decimal separators). */
export function isNumericValue(v: unknown): boolean {
	if (v === null || v === undefined || v === '') return false;
	if (typeof v === 'number') return Number.isFinite(v);
	const s = String(v).trim();
	if (!s) return false;
	return /^-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?$|^-?\d+(?:[.,]\d+)?$/.test(s);
}

/** True if every non-empty value in the column parses as a number, and at least one is present. */
export function isNumericColumn(items: Record<string, unknown>[], key: string): boolean {
	let seen = false;
	for (const item of items) {
		const v = item[key];
		if (v === null || v === undefined || v === '') continue;
		if (!isNumericValue(v)) return false;
		seen = true;
	}
	return seen;
}

/** True if a column key represents a code column (primary, FK, or variants). */
export function isCodeColumn(key: string): boolean {
	return key === 'code' || key === 'codeL' || key === 'refCode' || key.endsWith('_code');
}
