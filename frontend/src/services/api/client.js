import { STORAGE_KEYS } from '../../utils/constants.js';
import { readText, remove, writeText } from '../../utils/storage.js';
import { ApiError } from '../errors.js';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(
  /\/$/,
  '',
);

/* -- Token ---------------------------------------------------------------- */

let token = readText(STORAGE_KEYS.token);

export function getToken() {
  return token;
}

export function setToken(value) {
  token = value || null;
  if (token) writeText(STORAGE_KEYS.token, token);
  else remove(STORAGE_KEYS.token);
}

/* -- Session expiry ------------------------------------------------------- */

const unauthorizedListeners = new Set();

/** AuthProvider subscribes so a 401 anywhere signs the user out once. */
export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

/* -- Request -------------------------------------------------------------- */

const MESSAGES = {
  400: 'The request was rejected. Check the highlighted fields.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'We could not find what you were looking for.',
  409: 'That conflicts with something that already exists.',
  422: 'Some of the submitted values are invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
};

async function readBody(response) {
  const type = response.headers.get('content-type') || '';
  try {
    if (type.includes('application/json')) return await response.json();
    const text = await response.text();
    return text ? { message: text } : null;
  } catch {
    return null;
  }
}

/**
 * Performs an API request and normalises every failure mode into an ApiError.
 *
 * @param {string} path      Path below the API base, e.g. "/events".
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {object} [options.body]    Serialised as JSON.
 * @param {boolean} [options.auth]   Attach the bearer token (default true).
 * @param {AbortSignal} [options.signal]
 */
export async function request(path, options = {}) {
  const { method = 'GET', body, auth = true, signal } = options;

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      'Cannot reach the CampusOS server. Check your connection and try again.',
      { code: 'network' },
    );
  }

  const payload = await readBody(response);

  if (response.ok) return payload;

  const message =
    payload?.message ||
    MESSAGES[response.status] ||
    (response.status >= 500
      ? 'The server ran into a problem. Please try again shortly.'
      : 'The request could not be completed.');

  const error = new ApiError(message, {
    status: response.status,
    code: payload?.code ?? `http_${response.status}`,
    details: payload?.errors ?? null,
  });

  if (response.status === 401) {
    unauthorizedListeners.forEach((listener) => listener(error));
  }

  throw error;
}

export const get = (path, options) => request(path, { ...options });
export const post = (path, body, options) =>
  request(path, { ...options, method: 'POST', body });
export const patch = (path, body, options) =>
  request(path, { ...options, method: 'PATCH', body });
