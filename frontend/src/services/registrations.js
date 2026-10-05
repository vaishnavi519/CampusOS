import { apiRequest } from './api.js';

export async function registerForEvent(eventId) {
  const data = await apiRequest(`/events/${eventId}/register`, {
    method: 'POST',
  });

  return data.registration;
}

export async function listMyRegistrations() {
  const data = await apiRequest('/my-registrations');
  return data.registrations ?? [];
}

export async function getRegistrationForEvent(eventId) {
  const registrations = await listMyRegistrations();

  return (
    registrations.find(
      (registration) =>
        Number(registration.event_id) === Number(eventId),
    ) ?? null
  );
}

export async function getEventCapacity(eventId) {
  const data = await apiRequest(`/events/${eventId}`);
  const event = data.event;

  return {
    capacity: event?.capacity ?? 0,
    registered: event?.registered_count ?? 0,
    remaining:
      event?.capacity != null && event?.registered_count != null
        ? Math.max(0, event.capacity - event.registered_count)
        : null,
  };
}

export async function cancelRegistration(registrationId) {
  return apiRequest(`/registrations/${registrationId}/cancel`, {
    method: 'PATCH',
  });
}

export async function listEventRegistrations(eventId) {
  const data = await apiRequest(`/events/${eventId}/registrations`);

  return {
    event: data.event,
    registrations: data.registrations ?? [],
  };
}