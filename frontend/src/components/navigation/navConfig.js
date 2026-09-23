import { ROLES } from '../../utils/constants.js';

/**
 * Sidebar contents per role.
 *
 * Only routes that actually exist appear here — a nav item is never added
 * ahead of the screen it points at. A role sees only its own workspace plus
 * the shared account section; the backend remains the real authority on
 * access, this just keeps people out of screens that would only 403 on them.
 */

const SHARED = {
  label: 'Account',
  items: [
    { to: '/app/notifications', label: 'Notifications', icon: 'bell', badge: 'unread' },
    { to: '/app/profile', label: 'Profile', icon: 'user' },
  ],
};

/** Clubs and events are public endpoints, so every role can browse them. */
const BROWSE = {
  label: 'Campus',
  items: [
    { to: '/app/clubs', label: 'Clubs', icon: 'clubs' },
    { to: '/app/events', label: 'Events', icon: 'calendar' },
  ],
};

const STUDENT_NAV = [
  {
    label: null,
    items: [{ to: '/app', label: 'Dashboard', icon: 'dashboard', end: true }],
  },
  {
    label: 'Clubs',
    items: [
      { to: '/app/clubs', label: 'Browse clubs', icon: 'clubs' },
      { to: '/app/my-clubs', label: 'My clubs', icon: 'membership' },
    ],
  },
  {
    label: 'Events',
    items: [
      { to: '/app/events', label: 'Browse events', icon: 'calendar' },
      { to: '/app/recommendations', label: 'Recommended', icon: 'sparkle' },
      { to: '/app/registrations', label: 'My registrations', icon: 'registrations' },
      { to: '/app/participation', label: 'My participation', icon: 'chart' },
    ],
  },
  SHARED,
];

const CLUB_ADMIN_NAV = [
  {
    label: null,
    items: [
      { to: '/club-admin', label: 'Dashboard', icon: 'dashboard', end: true },
    ],
  },
  {
    label: 'Manage',
    items: [
      { to: '/club-admin/clubs', label: 'My clubs', icon: 'clubs' },
      { to: '/club-admin/events', label: 'My events', icon: 'calendar' },
    ],
  },
  BROWSE,
  SHARED,
];

const FACULTY_NAV = [
  {
    label: null,
    items: [{ to: '/faculty', label: 'Dashboard', icon: 'dashboard', end: true }],
  },
  {
    label: 'Approvals',
    items: [{ to: '/faculty/pending', label: 'Pending events', icon: 'review' }],
  },
  BROWSE,
  SHARED,
];

const ADMIN_NAV = [
  {
    label: null,
    items: [{ to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true }],
  },
  {
    label: 'Platform',
    items: [
      { to: '/admin/approved', label: 'Approved events', icon: 'broadcast' },
      { to: '/admin/statistics', label: 'Statistics', icon: 'chart' },
      { to: '/admin/users', label: 'Accounts', icon: 'users' },
    ],
  },
  BROWSE,
  SHARED,
];

/** Any role without a workspace of its own still gets the shared sections. */
const FALLBACK_NAV = [
  {
    label: null,
    items: [{ to: '/workspace', label: 'Overview', icon: 'dashboard', end: true }],
  },
  BROWSE,
  SHARED,
];

const BY_ROLE = {
  [ROLES.STUDENT]: STUDENT_NAV,
  [ROLES.CLUB_ADMIN]: CLUB_ADMIN_NAV,
  [ROLES.FACULTY_COORDINATOR]: FACULTY_NAV,
  [ROLES.SYSTEM_ADMIN]: ADMIN_NAV,
};

export function navigationFor(role) {
  return BY_ROLE[role] ?? FALLBACK_NAV;
}
