import { get, post } from './client.js';

/**
 * Live implementations of the attendance API.
 *
 *   POST /api/events/:id/attendance   { student_id, status }
 *   GET  /api/events/:id/attendance
 *
 * This is the single source of truth for attendance (§26). The frontend keeps
 * no parallel record of its own.
 */

/** GET /api/events/:id/attendance -> [{ student_id, status }]. Role: CLUB_ADMIN. */
export async function listAttendance(eventId, options) {
  const data = await get(`/events/${eventId}/attendance`, options);
  return (data.attendance ?? []).map((row) => ({
    student_id: row.student_id,
    status: row.status ?? null,
    marked_at: row.marked_at ?? null,
  }));
}

/** POST /api/events/:id/attendance. Role: CLUB_ADMIN. */
export async function markAttendance(eventId, { student_id, status }) {
  return post(`/events/${eventId}/attendance`, { student_id, status });
}
