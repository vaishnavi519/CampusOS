import { ApiError } from '../errors.js';
import { get, patch, post } from './client.js';

/**
 * Live implementations of backend/routes/eventRoutes.js.
 *
 * Functions deliberately absent because the backend has no such route yet:
 *   rejectEvent         (faculty declines a pending event)
 *   listClubAdminEvents (events created by the signed-in club admin)
 *   listApprovedEvents  (approved-but-unpublished queue for the system admin)
 */

/** GET /api/events -> Event[]. Public, PUBLISHED only, includes club_name. */
export async function listPublishedEvents(options) {
  const data = await get('/events', { ...options, auth: false });
  return data.events ?? [];
}

/**
 * There is no GET /api/events/:id. Rather than invent one, the detail screen
 * reads the published list and selects the event client-side. Replace this the
 * moment a single-event endpoint exists.
 */
export async function getPublishedEvent(id, options) {
  const events = await listPublishedEvents(options);
  const event = events.find((item) => String(item.id) === String(id));
  if (!event) {
    throw new ApiError('This event is no longer available.', { status: 404 });
  }
  return event;
}

/** POST /api/events -> Event (status DRAFT). Role: CLUB_ADMIN. */
export async function createEvent(payload) {
  const data = await post('/events', payload);
  return data.event;
}

/** PATCH /api/events/:id/submit. Role: CLUB_ADMIN. DRAFT -> PENDING_APPROVAL. */
export async function submitEvent(id) {
  return patch(`/events/${id}/submit`);
}

/** GET /api/events/pending -> Event[]. Role: FACULTY_COORDINATOR. */
export async function listPendingEvents(options) {
  const data = await get('/events/pending', options);
  return data.events ?? [];
}

/** PATCH /api/events/:id/approve. Role: FACULTY_COORDINATOR. */
export async function approveEvent(id) {
  return patch(`/events/${id}/approve`);
}

/** PATCH /api/events/:id/publish. Role: SYSTEM_ADMIN. APPROVED -> PUBLISHED. */
export async function publishEvent(id) {
  return patch(`/events/${id}/publish`);
}
