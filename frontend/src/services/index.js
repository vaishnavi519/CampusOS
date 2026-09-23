import { createService } from './dataSource.js';

import * as liveAuth from './api/auth.js';
import * as liveClubs from './api/clubs.js';
import * as liveEvents from './api/events.js';
import * as liveRegistrations from './api/registrations.js';
import * as liveNotifications from './api/notifications.js';
import * as liveAttendance from './api/attendance.js';
import * as liveReports from './api/reports.js';
import * as liveRecommendations from './api/recommendations.js';
import * as liveStats from './api/stats.js';

import * as demoAuth from './mocks/auth.js';
import * as demoClubs from './mocks/clubs.js';
import * as demoEvents from './mocks/events.js';
import * as demoNotifications from './mocks/notifications.js';
import * as demoRegistrations from './mocks/registrations.js';
import * as demoAttendance from './mocks/attendance.js';
import * as demoReports from './mocks/reports.js';
import * as demoRecommendations from './mocks/recommendations.js';
import * as demoStats from './mocks/stats.js';
import * as demoUsers from './mocks/users.js';

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
      note: 'Needs an endpoint listing users with the FACULTY_COORDINATOR role. POST /api/clubs requires faculty_coordinator_id.',
    },
  },
});

export const eventService = createService({
  live: liveEvents,
  demo: demoEvents,
  pending: {
    listClubAdminEvents: {
      feature: 'Your events',
      note: 'Needs an endpoint returning every event for the signed-in club admin, in all statuses. GET /api/events is published-only.',
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
  live: liveRegistrations,
  demo: demoRegistrations,
});

export const notificationService = createService({
  live: liveNotifications,
  demo: demoNotifications,
});

export const attendanceService = createService({
  live: liveAttendance,
  demo: demoAttendance,
});

export const reportService = createService({
  live: liveReports,
  demo: demoReports,
});

export const recommendationService = createService({
  live: liveRecommendations,
  demo: demoRecommendations,
});

export const statsService = createService({
  live: liveStats,
  demo: demoStats,
});

/**
 * Account management has no documented endpoint at all, so there is no live
 * implementation to point at — only the demo one and the notice below.
 */
export const userService = createService({
  live: {},
  demo: demoUsers,
  pending: {
    listUsers: {
      feature: 'Account management',
      note: 'Needs an endpoint listing platform accounts for a SYSTEM_ADMIN. Nothing equivalent is documented.',
    },
  },
});
