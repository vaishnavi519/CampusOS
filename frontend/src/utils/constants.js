/**
 * Shared vocabulary. Every value here mirrors something the backend actually
 * produces — see backend/controllers for the source of truth.
 */

export const ROLES = {
  STUDENT: 'STUDENT',
  CLUB_ADMIN: 'CLUB_ADMIN',
  FACULTY_COORDINATOR: 'FACULTY_COORDINATOR',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
};

export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Student',
  [ROLES.CLUB_ADMIN]: 'Club administrator',
  [ROLES.FACULTY_COORDINATOR]: 'Faculty coordinator',
  [ROLES.SYSTEM_ADMIN]: 'System administrator',
};

/**
 * Landing route for each role after sign-in. Each role owns a route prefix so
 * nothing but a guard change is needed to keep workspaces apart.
 */
export const ROLE_HOME = {
  [ROLES.STUDENT]: '/app',
  [ROLES.CLUB_ADMIN]: '/club-admin',
  [ROLES.FACULTY_COORDINATOR]: '/faculty',
  [ROLES.SYSTEM_ADMIN]: '/admin',
};

/** events.status — backend/controllers/eventController.js */
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
};

/** club_memberships.status — backend/controllers/clubController.js */
export const MEMBERSHIP_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

/** event_registrations.status — GET /api/my-registrations */
export const REGISTRATION_STATUS = {
  REGISTERED: 'REGISTERED',
  WAITLISTED: 'WAITLISTED',
  CANCELLED: 'CANCELLED',
};

/** Attendance status — POST/GET /api/events/:id/attendance */
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
};

export const CLUB_CATEGORIES = [
  'Technical',
  'Cultural',
  'Sports',
  'Literary',
  'Social Service',
  'Entrepreneurship',
];

export const STORAGE_KEYS = {
  token: 'campusos.token',
  user: 'campusos.user',
  apiMode: 'campusos.apiMode',
  demoState: 'campusos.demo.state',
  demoSession: 'campusos.demo.session',
};
