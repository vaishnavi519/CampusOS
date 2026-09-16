import { ROLES } from '../../utils/constants.js';

/**
 * Sidebar contents per role.
 *
 * Only routes that actually exist appear here — a nav item is never added
 * ahead of the screen it points at. Roles whose workspace is still being built
 * fall back to the shared section.
 */

const SHARED = {
  label: 'Account',
  items: [
    { to: '/app/notifications', label: 'Notifications', icon: 'bell', badge: 'unread' },
    { to: '/app/profile', label: 'Profile', icon: 'user' },
  ],
};

const STUDENT_NAV = [
  {
    label: null,
    items: [
      { to: '/app', label: 'Dashboard', icon: 'dashboard', end: true },
    ],
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
      { to: '/app/registrations', label: 'My registrations', icon: 'registrations' },
    ],
  },
  SHARED,
];

/** Roles without a workspace yet still get the shared account section. */
const FALLBACK_NAV = [
  {
    label: null,
    items: [{ to: '/workspace', label: 'Overview', icon: 'dashboard', end: true }],
  },
  {
    label: 'Browse',
    items: [
      { to: '/app/clubs', label: 'Clubs', icon: 'clubs' },
      { to: '/app/events', label: 'Events', icon: 'calendar' },
    ],
  },
  SHARED,
];

export function navigationFor(role) {
  if (role === ROLES.STUDENT) return STUDENT_NAV;
  return FALLBACK_NAV;
}
