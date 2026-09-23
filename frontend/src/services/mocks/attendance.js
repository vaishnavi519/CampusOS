import { ATTENDANCE_STATUS, ROLES } from '../../utils/constants.js';
import { ApiError } from '../errors.js';
import { requireRole } from './session.js';
import { clone, commit, latency, nextId, snapshot } from './store.js';

/** Demo counterpart of POST/GET /api/events/:id/attendance. */

/** Mirrors the backend ownership check: a club admin owns the event's club. */
function requireOwnedEvent(eventId) {
  const admin = requireRole(ROLES.CLUB_ADMIN);
  const { events, clubs } = snapshot();

  const event = events.find((row) => String(row.id) === String(eventId));
  const club = event && clubs.find((row) => row.id === event.club_id);
  if (!event || !club || club.admin_id !== admin.id) {
    throw new ApiError('Event not found or you do not administer it.', {
      status: 404,
    });
  }
  return { event, club };
}

export async function listAttendance(eventId) {
  await latency(200);
  const { event } = requireOwnedEvent(eventId);

  return clone(
    snapshot()
      .attendance.filter((row) => row.event_id === event.id)
      .map((row) => ({
        student_id: row.student_id,
        status: row.status,
        marked_at: row.marked_at,
      })),
  );
}

export async function markAttendance(eventId, { student_id, status }) {
  await latency(180);
  const { event } = requireOwnedEvent(eventId);

  if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
    throw new ApiError('Attendance status must be PRESENT or ABSENT.', {
      status: 400,
    });
  }

  const registered = snapshot().registrations.some(
    (row) =>
      row.event_id === event.id && String(row.student_id) === String(student_id),
  );
  if (!registered) {
    throw new ApiError('That student is not registered for this event.', {
      status: 400,
    });
  }

  return commit((draft) => {
    const existing = draft.attendance.find(
      (row) =>
        row.event_id === event.id &&
        String(row.student_id) === String(student_id),
    );

    if (existing) {
      existing.status = status;
      existing.marked_at = new Date().toISOString();
      return clone(existing);
    }

    const row = {
      id: nextId('attendance'),
      event_id: event.id,
      student_id: Number(student_id),
      status,
      marked_at: new Date().toISOString(),
    };
    draft.attendance.push(row);
    return clone(row);
  });
}
