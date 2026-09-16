import { EVENT_STATUS, REGISTRATION_STATUS, ROLES } from '../../utils/constants.js';
import { ApiError } from '../errors.js';
import { pushNotification } from './notifications.js';
import { requireRole } from './session.js';
import { clone, commit, latency, nextId, snapshot } from './store.js';

/** Demo implementations of the event endpoints, plus the ones still to be built. */

/** Joins the club name onto an event row, as the backend SQL does. */
function withClub(event, clubs) {
  const club = clubs.find((row) => row.id === event.club_id);
  return { ...event, club_name: club?.name ?? 'Unknown club' };
}

function byDate(a, b) {
  const dateDiff = String(a.event_date).localeCompare(String(b.event_date));
  return dateDiff !== 0
    ? dateDiff
    : String(a.event_time).localeCompare(String(b.event_time));
}

function listByStatus(status) {
  const { events, clubs } = snapshot();
  return clone(
    events
      .filter((event) => event.status === status)
      .map((event) => withClub(event, clubs))
      .sort(byDate),
  );
}

export async function listPublishedEvents() {
  await latency();
  return listByStatus(EVENT_STATUS.PUBLISHED);
}

export async function getPublishedEvent(id) {
  await latency();
  const { events, clubs } = snapshot();
  const event = events.find(
    (row) => String(row.id) === String(id) && row.status === EVENT_STATUS.PUBLISHED,
  );
  if (!event) {
    throw new ApiError('This event is no longer available.', { status: 404 });
  }
  return clone(withClub(event, clubs));
}

export async function createEvent(payload) {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);

  const club = snapshot().clubs.find(
    (row) => String(row.id) === String(payload.club_id),
  );
  if (!club || club.admin_id !== admin.id) {
    throw new ApiError(
      'You are not authorized to create an event for this club.',
      { status: 403 },
    );
  }

  return commit((state) => {
    const event = {
      id: nextId('events'),
      club_id: Number(payload.club_id),
      title: payload.title,
      description: payload.description || null,
      event_date: payload.event_date,
      event_time: payload.event_time,
      venue: payload.venue,
      capacity: Number(payload.capacity),
      eligibility: payload.eligibility || null,
      status: EVENT_STATUS.DRAFT,
      created_by: admin.id,
      created_at: new Date().toISOString(),
    };
    state.events.push(event);
    return clone(event);
  });
}

export async function submitEvent(id) {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);
  const { events, clubs, users } = snapshot();

  const event = events.find((row) => String(row.id) === String(id));
  const club = event && clubs.find((row) => row.id === event.club_id);

  if (!event || !club || club.admin_id !== admin.id) {
    throw new ApiError('Event not found or you are not the club admin.', {
      status: 404,
    });
  }
  if (event.status !== EVENT_STATUS.DRAFT) {
    throw new ApiError('Only draft events can be submitted for approval.', {
      status: 400,
    });
  }

  return commit((state) => {
    const row = state.events.find((item) => item.id === event.id);
    row.status = EVENT_STATUS.PENDING_APPROVAL;
    row.rejection_reason = null;

    const coordinator = users.find(
      (user) => user.id === club.faculty_coordinator_id,
    );
    if (coordinator) {
      pushNotification(state, {
        user_id: coordinator.id,
        type: 'EVENT_SUBMITTED',
        title: `${event.title} is waiting for your approval`,
        body: `${club.name} submitted an event for review.`,
        link: '/faculty/pending',
      });
    }

    return { message: 'Event submitted for faculty approval' };
  });
}

export async function listPendingEvents() {
  await latency();
  requireRole(ROLES.FACULTY_COORDINATOR);
  return listByStatus(EVENT_STATUS.PENDING_APPROVAL);
}

export async function approveEvent(id) {
  await latency();
  const faculty = requireRole(ROLES.FACULTY_COORDINATOR);
  const { events, clubs, users } = snapshot();

  const event = events.find((row) => String(row.id) === String(id));
  if (!event) throw new ApiError('Event not found.', { status: 404 });
  if (event.status !== EVENT_STATUS.PENDING_APPROVAL) {
    throw new ApiError('Only pending events can be approved.', { status: 400 });
  }

  return commit((state) => {
    const row = state.events.find((item) => item.id === event.id);
    row.status = EVENT_STATUS.APPROVED;
    row.approved_by = faculty.id;
    row.approved_at = new Date().toISOString();

    const club = clubs.find((item) => item.id === row.club_id);
    if (club) {
      pushNotification(state, {
        user_id: club.admin_id,
        type: 'EVENT_APPROVED',
        title: `${row.title} was approved`,
        body: 'It is now waiting for the system administrator to publish it.',
        link: `/club-admin/events/${row.id}`,
      });
    }

    for (const admin of users.filter((u) => u.role === ROLES.SYSTEM_ADMIN)) {
      pushNotification(state, {
        user_id: admin.id,
        type: 'EVENT_APPROVED',
        title: `${row.title} is ready to publish`,
        body: 'Faculty approval is complete.',
        link: '/admin/approved',
      });
    }

    return { message: 'Event approved successfully' };
  });
}

export async function publishEvent(id) {
  await latency();
  requireRole(ROLES.SYSTEM_ADMIN);
  const { events, clubs, memberships } = snapshot();

  const event = events.find((row) => String(row.id) === String(id));
  if (!event) throw new ApiError('Event not found.', { status: 404 });
  if (event.status !== EVENT_STATUS.APPROVED) {
    throw new ApiError('Only approved events can be published.', {
      status: 400,
    });
  }

  return commit((state) => {
    const row = state.events.find((item) => item.id === event.id);
    row.status = EVENT_STATUS.PUBLISHED;

    const club = clubs.find((item) => item.id === row.club_id);
    if (club) {
      pushNotification(state, {
        user_id: club.admin_id,
        type: 'EVENT_PUBLISHED',
        title: `${row.title} is now published`,
        body: 'Students can see and register for the event.',
        link: `/club-admin/events/${row.id}`,
      });

      // Members of the organising club hear about it too.
      for (const membership of memberships.filter(
        (item) => item.club_id === club.id && item.status === 'APPROVED',
      )) {
        pushNotification(state, {
          user_id: membership.student_id,
          type: 'EVENT_PUBLISHED',
          title: `${club.name} published ${row.title}`,
          body: 'Registration is open.',
          link: `/app/events/${row.id}`,
        });
      }
    }

    return { message: 'Event published successfully' };
  });
}

/* -- Not in the backend yet --------------------------------------------- */

/** BACKEND-PENDING: there is no reject route; faculty can only approve. */
export async function rejectEvent(id, reason) {
  await latency();
  requireRole(ROLES.FACULTY_COORDINATOR);
  const { events, clubs } = snapshot();

  const event = events.find((row) => String(row.id) === String(id));
  if (!event) throw new ApiError('Event not found.', { status: 404 });
  if (event.status !== EVENT_STATUS.PENDING_APPROVAL) {
    throw new ApiError('Only pending events can be rejected.', { status: 400 });
  }

  return commit((state) => {
    const row = state.events.find((item) => item.id === event.id);
    row.status = EVENT_STATUS.REJECTED;
    row.rejection_reason = reason || null;

    const club = clubs.find((item) => item.id === row.club_id);
    if (club) {
      pushNotification(state, {
        user_id: club.admin_id,
        type: 'EVENT_REJECTED',
        title: `${row.title} was rejected`,
        body: reason || 'The faculty coordinator returned this event.',
        link: `/club-admin/events/${row.id}`,
      });
    }

    return { message: 'Event rejected' };
  });
}

/** BACKEND-PENDING: no route lists the events belonging to a club admin. */
export async function listClubAdminEvents() {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);
  const { events, clubs, registrations } = snapshot();

  const ownedClubIds = clubs
    .filter((club) => club.admin_id === admin.id)
    .map((club) => club.id);

  return clone(
    events
      .filter((event) => ownedClubIds.includes(event.club_id))
      .map((event) => ({
        ...withClub(event, clubs),
        registration_count: registrations.filter(
          (row) =>
            row.event_id === event.id &&
            row.status === REGISTRATION_STATUS.REGISTERED,
        ).length,
      }))
      .sort(byDate),
  );
}

/** BACKEND-PENDING: no route lists approved-but-unpublished events. */
export async function listApprovedEvents() {
  await latency();
  requireRole(ROLES.SYSTEM_ADMIN);
  return listByStatus(EVENT_STATUS.APPROVED);
}

/**
 * BACKEND-PENDING: no single-event route exists. Demo mode can look up any
 * event regardless of status, subject to the caller's role.
 */
export async function getEvent(id) {
  await latency();
  const { events, clubs } = snapshot();
  const event = events.find((row) => String(row.id) === String(id));
  if (!event) throw new ApiError('Event not found.', { status: 404 });
  return clone(withClub(event, clubs));
}
