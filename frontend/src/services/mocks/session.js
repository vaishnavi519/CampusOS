import { STORAGE_KEYS } from '../../utils/constants.js';
import { readJSON, remove, writeJSON } from '../../utils/storage.js';
import { ApiError } from '../errors.js';
import { snapshot } from './store.js';

/**
 * Demo-mode session. There is no server to decode a JWT, so the signed-in user
 * id is tracked here and mirrored to localStorage for refresh survival.
 */

let userId = readJSON(STORAGE_KEYS.demoSession)?.userId ?? null;

export function setSession(id) {
  userId = id;
  writeJSON(STORAGE_KEYS.demoSession, { userId: id });
}

export function clearSession() {
  userId = null;
  remove(STORAGE_KEYS.demoSession);
}

export function currentUserId() {
  return userId;
}

/** Mirrors the backend `protect` middleware. */
export function requireUser() {
  const user = snapshot().users.find((row) => row.id === userId);
  if (!user) {
    throw new ApiError('Your session has expired. Please sign in again.', {
      status: 401,
    });
  }
  return user;
}

/** Mirrors the backend `authorize(...roles)` middleware. */
export function requireRole(...roles) {
  const user = requireUser();
  if (!roles.includes(user.role)) {
    throw new ApiError(
      'You do not have permission to perform this action.',
      { status: 403 },
    );
  }
  return user;
}
