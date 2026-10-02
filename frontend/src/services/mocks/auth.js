import api from '../api.js';
import { ApiError } from '../errors.js';

function handleError(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  const message =
    data?.detail ||
    data?.message ||
    data?.email?.[0] ||
    data?.password?.[0] ||
    'Something went wrong. Please try again.';

  throw new ApiError(message, { status: status || 500 });
}

export async function login({ email, password }) {
  try {
    const response = await api.post('/auth/login', {
      email: email.trim(),
      password,
    });

    const data = response.data;

   return {
  token: data.tokens?.access || data.access || data.token,
  user: data.user,
};
  } catch (error) {
    handleError(error);
  }
}

export async function register({ name, email, password }) {
  try {
    const response = await api.post('/auth/register', {
      name: name.trim(),
      email: email.trim(),
      password,
    });

    return response.data.user;
  } catch (error) {
    handleError(error);
  }
}

export async function getProfile() {
  try {
    const response = await api.get('/auth/profile');

    return response.data.user || response.data;
  } catch (error) {
    handleError(error);
  }
}

export function logout() {
  // JWT session is cleared by AuthContext.
}