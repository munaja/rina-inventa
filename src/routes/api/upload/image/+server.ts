import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import pool from '$lib/server/db.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const id = Number(formData.get('id'));

	if (!file || !id) {
		return json({ success: false, error: 'File dan ID wajib diisi' }, { status: 400 });
	}

	try {
		const now = new Date();
		const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

		const dir = path.resolve('static', 'img', 'inspection', 'tool-machine-inspection', dateStr);
		await mkdir(dir, { recursive: true });

		const filePath = path.join(dir, `${id}.jpg`);
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filePath, buffer);

		const imgUrl = `/img/inspection/tool-machine-inspection/${dateStr}/${id}.jpg`;
		await pool.execute('UPDATE toolMachineInspection SET imgUrl = ? WHERE id = ?', [imgUrl, id]);

		return json({ success: true, url: imgUrl });
	} catch (e: unknown) {
		return json({ success: false, error: (e as Error).message }, { status: 500 });
	}
};
