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

/** The only module screens import data from. All services operate locally. */
export const authService = demoAuth;
export const clubService = demoClubs;
export const eventService = demoEvents;
export const registrationService = demoRegistrations;
export const notificationService = demoNotifications;
export const attendanceService = demoAttendance;
export const reportService = demoReports;
export const recommendationService = demoRecommendations;
export const statsService = demoStats;
export const userService = demoUsers;
