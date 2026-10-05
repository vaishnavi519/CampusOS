import { apiRequest } from './api.js';

export async function listUsers() {
  const data = await apiRequest('/users');
  return data.users ?? [];
}

export async function listCoordinators() {
  const data = await apiRequest('/users/coordinators');
  return data.coordinators ?? [];
}

export async function createUser(payload) {
  const data = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.user;
}

export async function resetUserPassword(userId, password) {
  const data = await apiRequest(`/users/${userId}/password`, {
    method: 'PATCH',
    body: JSON.stringify({
      password,
    }),
  });

  return data.user;
}