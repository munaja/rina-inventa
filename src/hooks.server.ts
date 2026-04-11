import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('session');

	if (token) {
		const result = await validateSession(token);
		if (result) {
			event.locals.user = result.user;
			event.locals.sessionId = result.sessionId;
		} else {
			event.cookies.delete('session', { path: '/' });
		}
	}

	if (event.url.pathname.startsWith('/admin')) {
		if (!event.locals.user) {
			throw redirect(303, '/login');
		}
		if (event.url.pathname.startsWith('/admin/users') && event.locals.user.role !== 'admin') {
			throw redirect(303, '/admin');
		}
	}

	return resolve(event);
};
