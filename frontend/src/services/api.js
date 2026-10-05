const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('campusos.token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    if (response.status === 401) {
      localStorage.removeItem('campusos.token');
      localStorage.removeItem('campusos.user');
    }

    throw error;
  }

  return data;
}
