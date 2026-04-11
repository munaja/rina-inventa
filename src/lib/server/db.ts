import mysql from 'mysql2/promise';
import { env } from '$env/dynamic/private';

const pool = mysql.createPool({
	host: env.DATABASE_HOST,
	user: env.DATABASE_USER,
	password: env.DATABASE_PASSWORD,
	database: env.DATABASE_NAME,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	dateStrings: true,
	enableKeepAlive: true,
	keepAliveInitialDelay: 10000
});

export default pool;
