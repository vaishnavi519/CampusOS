import {
  EVENT_STATUS,
  MEMBERSHIP_STATUS,
  REGISTRATION_STATUS,
} from './constants.js';

/**
 * Status presentation. Every descriptor carries a `glyph` as well as a `tone`
 * so status is never communicated by colour alone.
 */

const EVENT_DESCRIPTORS = {
  [EVENT_STATUS.DRAFT]: {
    label: 'Draft',
    tone: 'neutral',
    glyph: 'dot',
    hint: 'Only visible to the organising club.',
  },
  [EVENT_STATUS.PENDING_APPROVAL]: {
    label: 'Awaiting approval',
    tone: 'warning',
    glyph: 'clock',
    hint: 'Waiting on the faculty coordinator.',
  },
  [EVENT_STATUS.APPROVED]: {
    label: 'Approved',
    tone: 'success',
    glyph: 'check',
    hint: 'Approved by faculty, not yet published.',
  },
  [EVENT_STATUS.PUBLISHED]: {
    label: 'Published',
    tone: 'accent',
    glyph: 'broadcast',
    hint: 'Visible to all students.',
  },
  [EVENT_STATUS.REJECTED]: {
    label: 'Rejected',
    tone: 'danger',
    glyph: 'cross',
    hint: 'Returned by the faculty coordinator.',
  },
};

const MEMBERSHIP_DESCRIPTORS = {
  [MEMBERSHIP_STATUS.PENDING]: {
    label: 'Request pending',
    tone: 'warning',
    glyph: 'clock',
    hint: 'The club administrator has not reviewed your request yet.',
  },
  [MEMBERSHIP_STATUS.APPROVED]: {
    label: 'Member',
    tone: 'success',
    glyph: 'check',
    hint: 'You are an approved member of this club.',
  },
  [MEMBERSHIP_STATUS.REJECTED]: {
    label: 'Not accepted',
    tone: 'danger',
    glyph: 'cross',
    hint: 'This membership request was declined.',
  },
};

const REGISTRATION_DESCRIPTORS = {
  [REGISTRATION_STATUS.REGISTERED]: {
    label: 'Registered',
    tone: 'success',
    glyph: 'check',
    hint: 'Your seat is confirmed.',
  },
  [REGISTRATION_STATUS.WAITLISTED]: {
    label: 'Waitlisted',
    tone: 'warning',
    glyph: 'clock',
    hint: 'The event is full. You will be moved up if a seat frees.',
  },
  [REGISTRATION_STATUS.CANCELLED]: {
    label: 'Cancelled',
    tone: 'neutral',
    glyph: 'cross',
    hint: 'You withdrew from this event.',
  },
};

const FALLBACK = { label: 'Unknown', tone: 'neutral', glyph: 'dot', hint: '' };

function lookup(table, status) {
  if (!status) return FALLBACK;
  return table[status] ?? { ...FALLBACK, label: humanize(status) };
}

/** "PENDING_APPROVAL" -> "Pending approval" — for values we do not know yet. */
export function humanize(value) {
  if (!value) return '';
  const text = String(value).replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export const eventStatus = (status) => lookup(EVENT_DESCRIPTORS, status);
export const membershipStatus = (status) =>
  lookup(MEMBERSHIP_DESCRIPTORS, status);
export const registrationStatus = (status) =>
  lookup(REGISTRATION_DESCRIPTORS, status);

export const STATUS_KINDS = {
  event: eventStatus,
  membership: membershipStatus,
  registration: registrationStatus,
};
