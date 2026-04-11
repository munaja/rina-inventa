import { hash, compare } from 'bcryptjs';
import { randomBytes } from 'crypto';
import pool from './db.js';
import type { RowDataPacket } from 'mysql2';
import type { User } from '$lib/types.js';

export async function hashPassword(password: string): Promise<string> {
	return hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
	return compare(password, hashed);
}

export async function createSession(userId: number): Promise<string> {
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	await pool.execute('INSERT INTO `session` (id, user_id, expiresAt) VALUES (?, ?, ?)', [
		token,
		userId,
		expiresAt
	]);
	return token;
}

export async function validateSession(
	token: string
): Promise<{ user: User; sessionId: string } | null> {
	const [rows] = await pool.execute<RowDataPacket[]>(
		`SELECT u.id, u.username, u.role, u.createdAt, u.updatedAt, s.id as sessionId
		 FROM \`session\` s
		 JOIN \`user\` u ON s.user_id = u.id
		 WHERE s.id = ? AND s.expiresAt > NOW()`,
		[token]
	);
	if (rows.length === 0) return null;
	const row = rows[0];
	return {
		user: {
			id: row.id,
			username: row.username,
			role: row.role,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		},
		sessionId: row.sessionId
	};
}

export async function destroySession(token: string): Promise<void> {
	await pool.execute('DELETE FROM `session` WHERE id = ?', [token]);
}
