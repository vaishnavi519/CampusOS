import { get, patch, post } from './client.js';
import { listPublishedEvents } from './events.js';

/**
 * Live implementations of the event-registration API.
 *
 *   POST  /api/events/:id/register
 *   GET   /api/my-registrations
 *   PATCH /api/registrations/:registrationId/cancel
 *   GET   /api/events/:id/registrations
 *
 * The documented /my-registrations row is thin ({ id, event_id, status }), so
 * the display fields every registration screen needs (title, date, venue, club)
 * are filled from the public events list when — and only when — the API did not
 * send them itself. Nothing is invented: an unresolved field stays null and the
 * UI renders its placeholder.
 */

/** Adapter boundary (§21): API field names in, one stable UI shape out. */
function normalizeRegistration(row, eventsById) {
  const eventId = row.event_id ?? row.eventId ?? null;
  const event = eventsById.get(String(eventId)) ?? {};

  return {
    // The list endpoint calls it `id`; the club-admin endpoint may send
    // `registration_id`. Both are exposed so no caller has to care.
    id: row.registration_id ?? row.id ?? null,
    registration_id: row.registration_id ?? row.id ?? null,
    event_id: eventId,
    student_id: row.student_id ?? null,
    status: row.status ?? null,
    attendance_status: row.attendance_status ?? null,
    registered_at: row.registered_at ?? null,
    cancelled_at: row.cancelled_at ?? null,

    title: row.title ?? event.title ?? null,
    event_date: row.event_date ?? event.event_date ?? null,
    event_time: row.event_time ?? event.event_time ?? null,
    venue: row.venue ?? event.venue ?? null,
    capacity: row.capacity ?? event.capacity ?? null,
    club_id: row.club_id ?? event.club_id ?? null,
    club_name: row.club_name ?? event.club_name ?? null,
  };
}

/** Published events keyed by id. A failure here must not fail the whole list. */
async function publishedEventsById(options) {
  try {
    const events = await listPublishedEvents(options);
    return new Map(events.map((event) => [String(event.id), event]));
  } catch {
    return new Map();
  }
}

/** GET /api/my-registrations -> Registration[]. Role: STUDENT. */
export async function listMyRegistrations(options) {
  const [data, eventsById] = await Promise.all([
    get('/my-registrations', options),
    publishedEventsById(options),
  ]);

  return (data.registrations ?? [])
    .map((row) => normalizeRegistration(row, eventsById))
    .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)));
}

/**
 * This student's registration for one event, or null.
 *
 * There is no single-registration endpoint, so the list is filtered. A
 * cancelled row is still returned — the detail screen distinguishes the two.
 */
export async function getRegistrationForEvent(eventId, options) {
  const rows = await listMyRegistrations(options);
  return (
    rows.find((row) => String(row.event_id) === String(eventId)) ?? null
  );
}

/**
 * Seats taken is only knowable through GET /events/:id/registrations, which is
 * CLUB_ADMIN-only. A student therefore gets capacity without a taken count, and
 * the UI hides "seats remaining" rather than guessing at it.
 */
export async function getEventCapacity(eventId, options) {
  const events = await listPublishedEvents(options);
  const event = events.find((row) => String(row.id) === String(eventId));
  if (!event) return null;
  return { capacity: event.capacity, taken: null };
}

/** POST /api/events/:id/register. Role: STUDENT. No request body. */
export async function registerForEvent(eventId) {
  const data = await post(`/events/${eventId}/register`);
  return data?.registration ?? { event_id: eventId, status: data?.status ?? null };
}

/** PATCH /api/registrations/:registrationId/cancel. Role: STUDENT. */
export async function cancelRegistration(registrationId) {
  return patch(`/registrations/${registrationId}/cancel`);
}

/** GET /api/events/:id/registrations -> { event, registrations }. Role: CLUB_ADMIN. */
export async function listEventRegistrations(eventId, options) {
  const data = await get(`/events/${eventId}/registrations`, options);
  const rows = data.registrations ?? [];

  return {
    event: data.event ?? { id: eventId },
    registrations: rows.map((row) => ({
      registration_id: row.registration_id ?? row.id ?? null,
      student_id: row.student_id ?? null,
      student_name: row.student_name ?? row.name ?? null,
      student_email: row.student_email ?? row.email ?? null,
      status: row.status ?? null,
      registered_at: row.registered_at ?? null,
    })),
  };
}
