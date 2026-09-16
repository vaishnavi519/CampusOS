import { createService } from './dataSource.js';

import * as liveAuth from './api/auth.js';
import * as liveClubs from './api/clubs.js';
import * as liveEvents from './api/events.js';

import * as demoAuth from './mocks/auth.js';
import * as demoClubs from './mocks/clubs.js';
import * as demoEvents from './mocks/events.js';
import * as demoNotifications from './mocks/notifications.js';
import * as demoRegistrations from './mocks/registrations.js';

/**
 * The only module screens import data from.
 *
 * Methods present in the demo implementation but missing from the live one are
 * features the backend has not built. In live mode they reject with
 * NotImplementedError, and the UI renders an explicit notice — never mock data
 * dressed up as a real response. `pending` supplies the copy for those notices
 * and doubles as the backend handoff list (see BACKEND_INTEGRATION.md).
 */

export const authService = createService({
  live: liveAuth,
  demo: demoAuth,
});

export const clubService = createService({
  live: liveClubs,
  demo: demoClubs,
  pending: {
    reviewMembership: {
      feature: 'Approving membership requests',
      note: 'Needs an endpoint that sets club_memberships.status to APPROVED or REJECTED.',
    },
    listAdminClubs: {
      feature: 'Your clubs',
      note: 'Needs an endpoint returning the clubs owned by the signed-in club admin.',
    },
    listCoordinators: {
      feature: 'Faculty coordinator lookup',
      note: 'Needs an endpoint listing users with the FACULTY_COORDINATOR role.',
    },
  },
});

export const eventService = createService({
  live: liveEvents,
  demo: demoEvents,
  pending: {
    rejectEvent: {
      feature: 'Rejecting an event',
      note: 'Needs PATCH /api/events/:id/reject. Only approval exists today.',
    },
    listClubAdminEvents: {
      feature: 'Your events',
      note: 'Needs an endpoint returning every event for the signed-in club admin, in all statuses.',
    },
    listApprovedEvents: {
      feature: 'Approved events',
      note: 'Needs an endpoint returning events with status APPROVED. GET /api/events returns published events only.',
    },
    getEvent: {
      feature: 'Event details',
      note: 'Needs GET /api/events/:id for events that are not published yet.',
    },
  },
});

export const registrationService = createService({
  live: {},
  demo: demoRegistrations,
  pending: {
    listMyRegistrations: {
      feature: 'Your registrations',
      note: 'Needs an endpoint returning the signed-in student’s event registrations.',
    },
    registerForEvent: {
      feature: 'Event registration',
      note: 'Needs POST /api/events/:id/register.',
    },
    cancelRegistration: {
      feature: 'Cancelling a registration',
      note: 'Needs a cancel endpoint. Until it exists the Cancel action stays hidden in live mode.',
    },
    listEventRegistrations: {
      feature: 'Event attendees',
      note: 'Needs an endpoint returning registrations for a club admin’s event.',
    },
    getRegistrationForEvent: {
      feature: 'Registration status',
      note: 'Depends on the registrations API.',
    },
    getEventCapacity: {
      feature: 'Seats remaining',
      note: 'Depends on the registrations API. Capacity alone is available from the event record.',
    },
  },
});

export const notificationService = createService({
  live: {},
  demo: demoNotifications,
  pending: {
    listNotifications: {
      feature: 'Notifications',
      note: 'Needs a notifications table and an endpoint returning the signed-in user’s notifications.',
    },
    countUnread: { feature: 'Unread count', note: 'Depends on the notifications API.' },
    markRead: { feature: 'Marking notifications read', note: 'Depends on the notifications API.' },
    markAllRead: { feature: 'Marking notifications read', note: 'Depends on the notifications API.' },
  },
});
