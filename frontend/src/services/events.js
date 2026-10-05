import { apiRequest } from './api.js';

export async function listEvents() {
  const data = await apiRequest('/events');
  return data.events ?? [];
}

// The backend's GET /events endpoint already returns published events.
export async function listPublishedEvents() {
  const data = await apiRequest('/events');
  return data.events ?? [];
}

export async function getEvent(id) {
  const data = await apiRequest(`/events/${id}`);
  return data.event;
}

export async function getPublishedEvent(id) {
  const data = await apiRequest(`/events/${id}`);
  return data.event;
}

export async function createEvent(payload) {
  const data = await apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return data.event;
}

export async function listMyEvents() {
  const data = await apiRequest('/events/my-events');
  return data.events ?? [];
}

export async function listClubAdminEvents() {
  return listMyEvents();
}

export async function listPendingEvents() {
  const data = await apiRequest('/events/pending');
  return data.events ?? [];
}

export async function listApprovedEvents() {
  const data = await apiRequest('/events/approved');
  return data.events ?? [];
}

export async function submitEvent(id) {
  return apiRequest(`/events/${id}/submit`, {
    method: 'PATCH',
  });
}

export async function approveEvent(id) {
  return apiRequest(`/events/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectEvent(id, rejection_reason) {
  return apiRequest(`/events/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejection_reason }),
  });
}

export async function publishEvent(id) {
  return apiRequest(`/events/${id}/publish`, {
    method: 'PATCH',
  });
}