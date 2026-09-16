import { get, post } from './client.js';

/**
 * Live implementations of backend/routes/authRoutes.js.
 * Response envelopes ({ success, ... }) are unwrapped here so the rest of the
 * app only ever deals with plain domain objects.
 */

/** POST /api/auth/login -> { token, user } */
export async function login({ email, password }) {
  const data = await post('/auth/login', { email, password }, { auth: false });
  return { token: data.token, user: data.user };
}

/** POST /api/auth/register -> { user }. Does not return a token. */
export async function register({ name, email, password, role }) {
  const data = await post(
    '/auth/register',
    { name, email, password, role },
    { auth: false },
  );
  return data.user;
}

/** GET /api/auth/profile -> user (id, name, email, role, created_at) */
export async function getProfile(options) {
  const data = await get('/auth/profile', options);
  return data.user;
}

/** Live sessions are stateless; the client just drops the token. */
export function logout() {}
