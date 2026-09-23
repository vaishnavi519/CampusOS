import { ApiError } from '../errors.js';
import { get, patch, post } from './client.js';

/**
 * Live implementations of the events API.
 *
 * Functions deliberately absent because no endpoint is documented for them:
 *   listClubAdminEvents (a club admin's own events, in every status)
 *   listApprovedEvents  (approved-but-unpublished queue for the system admin)
 *   getEvent            (a single event that is not published yet)
 * They raise NotImplementedError in live mode — see services/dataSource.js.
 */

/**
 * GET /api/events -> Event[]. Public, PUBLISHED only, includes club_name.
 *
 * Concurrent callers share one request. An event screen asks for the published
 * list from three places at once (the event itself, the viewer's registration,
 * and capacity), and there is no reason for that to be three round trips. Only
 * in-flight calls are shared — once one settles the next call refetches, so
 * this can never serve a stale list.
 */
let inFlightPublished = null;

export async function listPublishedEvents(options) {
  // A caller passing its own AbortSignal opts out: sharing a request would let
  // one screen's unmount cancel another's load.
  if (options?.signal) {
    const data = await get('/events', { ...options, auth: false });
    return data.events ?? [];
  }

  if (!inFlightPublished) {
    inFlightPublished = get('/events', { ...options, auth: false })
      .then((data) => data.events ?? [])
      .finally(() => {
        inFlightPublished = null;
      });
  }

  return inFlightPublished;
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

/**
 * PATCH /api/events/:id/reject. Role: FACULTY_COORDINATOR.
 * The reason is required by the contract, so it is validated before the call
 * rather than relying on a 400 to surface an empty textarea.
 */
export async function rejectEvent(id, rejectionReason) {
  const reason = String(rejectionReason ?? '').trim();
  if (!reason) {
    throw new ApiError('A rejection reason is required.', { status: 400 });
  }
  return patch(`/events/${id}/reject`, { rejection_reason: reason });
}

/** PATCH /api/events/:id/publish. Role: SYSTEM_ADMIN. APPROVED -> PUBLISHED. */
export async function publishEvent(id) {
  return patch(`/events/${id}/publish`);
}
