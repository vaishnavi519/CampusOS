import { apiRequest } from './api.js';

export async function login({ email, password }) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (data.token) {
    localStorage.setItem('campusos.token', data.token);
  }

  if (data.user) {
    localStorage.setItem('campusos.user', JSON.stringify(data.user));
  }

  return data;
}

export async function register(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProfile() {
  const data = await apiRequest('/auth/profile');
  return data.user;
}

export function logout() {
  localStorage.removeItem('campusos.token');
  localStorage.removeItem('campusos.user');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('campusos.user');
  return raw ? JSON.parse(raw) : null;
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('campusos.token'));
}