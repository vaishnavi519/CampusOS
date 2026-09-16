import { ROLES } from '../../utils/constants.js';
import { ApiError } from '../errors.js';
import { DEMO_PASSWORD } from './seed.js';
import { clearSession, requireUser, setSession } from './session.js';
import { clone, commit, latency, nextId, snapshot } from './store.js';

/** Demo implementations of the auth endpoints. Error cases match the backend. */

const ALLOWED_ROLES = Object.values(ROLES);

function passwordFor(user) {
  return snapshot().credentials[user.id] ?? DEMO_PASSWORD;
}

export async function login({ email, password }) {
  await latency();

  const user = snapshot().users.find(
    (row) => row.email.toLowerCase() === String(email).trim().toLowerCase(),
  );

  if (!user || passwordFor(user) !== password) {
    throw new ApiError('Invalid email or password.', { status: 401 });
  }

  setSession(user.id);

  return {
    // Not a JWT. Demo mode has no server to sign one.
    token: `demo.${user.id}`,
    user: clone({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }),
  };
}

export async function register({ name, email, password, role }) {
  await latency();

  const normalised = String(email).trim().toLowerCase();
  const taken = snapshot().users.some(
    (row) => row.email.toLowerCase() === normalised,
  );

  if (taken) {
    throw new ApiError('Email already registered', { status: 409 });
  }

  const userRole = ALLOWED_ROLES.includes(role) ? role : ROLES.STUDENT;

  return commit((state) => {
    const user = {
      id: nextId('users'),
      name: String(name).trim(),
      email: normalised,
      role: userRole,
      created_at: new Date().toISOString(),
    };
    state.users.push(user);
    state.credentials[user.id] = password;
    return clone(user);
  });
}

export async function getProfile() {
  await latency(160);
  const user = requireUser();
  return clone({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  });
}

export function logout() {
  clearSession();
}
