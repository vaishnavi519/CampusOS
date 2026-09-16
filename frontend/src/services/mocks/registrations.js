import {
  EVENT_STATUS,
  REGISTRATION_STATUS,
  ROLES,
} from '../../utils/constants.js';
import { ApiError } from '../errors.js';
import { pushNotification } from './notifications.js';
import { requireRole } from './session.js';
import { clone, commit, latency, nextId, snapshot } from './store.js';

/**
 * BACKEND-PENDING: event registration does not exist in the backend yet.
 * Everything here is demo-only. In live mode these calls raise
 * NotImplementedError and the UI says so plainly.
 */

const isActive = (row) => row.status !== REGISTRATION_STATUS.CANCELLED;

/** Seats taken for an event — used for capacity display everywhere. */
export function countSeatsTaken(state, eventId) {
  return state.registrations.filter(
    (row) => row.event_id === eventId && isActive(row),
  ).length;
}

export async function listMyRegistrations() {
  await latency();
  const student = requireRole(ROLES.STUDENT);
  const { registrations, events, clubs } = snapshot();

  const rows = registrations
    .filter((row) => row.student_id === student.id)
    .map((row) => {
      const event = events.find((item) => item.id === row.event_id);
      const club = clubs.find((item) => item.id === event?.club_id);
      return {
        registration_id: row.id,
        event_id: row.event_id,
        status: row.status,
        registered_at: row.registered_at,
        cancelled_at: row.cancelled_at ?? null,
        title: event?.title ?? 'Unknown event',
        event_date: event?.event_date ?? null,
        event_time: event?.event_time ?? null,
        venue: event?.venue ?? null,
        club_id: event?.club_id ?? null,
        club_name: club?.name ?? null,
      };
    })
    .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)));

  return clone(rows);
}

/** Registration state for one event, for the current student. */
export async function getRegistrationForEvent(eventId) {
  const student = requireRole(ROLES.STUDENT);
  const state = snapshot();
  const row = state.registrations.find(
    (item) =>
      String(item.event_id) === String(eventId) &&
      item.student_id === student.id,
  );
  return clone(row ?? null);
}

/** Seats taken / capacity for one event. */
export async function getEventCapacity(eventId) {
  const state = snapshot();
  const event = state.events.find((row) => String(row.id) === String(eventId));
  if (!event) return null;
  return {
    capacity: event.capacity,
    taken: countSeatsTaken(state, event.id),
  };
}

export async function registerForEvent(eventId) {
  await latency();
  const student = requireRole(ROLES.STUDENT);
  const state = snapshot();

  const event = state.events.find((row) => String(row.id) === String(eventId));
  if (!event) throw new ApiError('Event not found.', { status: 404 });
  if (event.status !== EVENT_STATUS.PUBLISHED) {
    throw new ApiError('Registration is only open for published events.', {
      status: 400,
    });
  }

  const existing = state.registrations.find(
    (row) => row.event_id === event.id && row.student_id === student.id,
  );
  if (existing && isActive(existing)) {
    throw new ApiError('You are already registered for this event.', {
      status: 409,
    });
  }

  const full = countSeatsTaken(state, event.id) >= event.capacity;

  return commit((draft) => {
    const status = full
      ? REGISTRATION_STATUS.WAITLISTED
      : REGISTRATION_STATUS.REGISTERED;

    let row;
    if (existing) {
      row = draft.registrations.find((item) => item.id === existing.id);
      row.status = status;
      row.registered_at = new Date().toISOString();
      row.cancelled_at = null;
    } else {
      row = {
        id: nextId('registrations'),
        event_id: event.id,
        student_id: student.id,
        status,
        registered_at: new Date().toISOString(),
        cancelled_at: null,
      };
      draft.registrations.push(row);
    }

    pushNotification(draft, {
      user_id: student.id,
      type: full ? 'REGISTRATION_WAITLISTED' : 'REGISTRATION_CONFIRMED',
      title: full
        ? `You are on the waitlist for ${event.title}`
        : `You are registered for ${event.title}`,
      body: full
        ? 'All seats are taken. You will move up if one frees.'
        : `${event.venue}.`,
      link: '/app/registrations',
    });

    return clone(row);
  });
}

export async function cancelRegistration(registrationId) {
  await latency();
  const student = requireRole(ROLES.STUDENT);

  const existing = snapshot().registrations.find(
    (row) => String(row.id) === String(registrationId),
  );
  if (!existing || existing.student_id !== student.id) {
    throw new ApiError('Registration not found.', { status: 404 });
  }
  if (!isActive(existing)) {
    throw new ApiError('This registration is already cancelled.', {
      status: 400,
    });
  }

  return commit((draft) => {
    const row = draft.registrations.find((item) => item.id === existing.id);
    row.status = REGISTRATION_STATUS.CANCELLED;
    row.cancelled_at = new Date().toISOString();
    return clone(row);
  });
}

/** Attendee list for a club admin's event. */
export async function listEventRegistrations(eventId) {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);
  const { events, clubs, registrations, users } = snapshot();

  const event = events.find((row) => String(row.id) === String(eventId));
  const club = event && clubs.find((row) => row.id === event.club_id);
  if (!event || !club || club.admin_id !== admin.id) {
    throw new ApiError('Event not found or you do not administer it.', {
      status: 404,
    });
  }

  const rows = registrations
    .filter((row) => row.event_id === event.id)
    .map((row) => {
      const student = users.find((item) => item.id === row.student_id);
      return {
        registration_id: row.id,
        student_id: row.student_id,
        student_name: student?.name ?? 'Unknown student',
        student_email: student?.email ?? '',
        status: row.status,
        registered_at: row.registered_at,
      };
    })
    .sort((a, b) => new Date(a.registered_at) - new Date(b.registered_at));

  return clone({
    event: {
      id: event.id,
      title: event.title,
      capacity: event.capacity,
      club_name: club.name,
    },
    registrations: rows,
  });
}
