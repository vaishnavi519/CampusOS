/**
 * Date/time helpers.
 *
 * MySQL DATE columns arrive as UTC-midnight ISO strings ("2025-10-04T00:00:00.000Z").
 * Rendering those with the local timezone can move the event a day backwards, so
 * calendar dates are always parsed from their Y-M-D parts as a *local* date.
 * TIME columns arrive as "HH:MM:SS".
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const PLACEHOLDER = 'Not specified';

/** Parse a calendar date (no timezone shifting). Returns null when unusable. */
export function parseCalendarDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** "4 Oct 2025" */
export function formatDate(value) {
  const date = parseCalendarDate(value);
  if (!date) return PLACEHOLDER;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "Sat, 4 Oct 2025" */
export function formatDateLong(value) {
  const date = parseCalendarDate(value);
  if (!date) return PLACEHOLDER;
  return `${WEEKDAYS[date.getDay()]}, ${formatDate(date)}`;
}

/** Parts for the compact calendar chip. */
export function dateChipParts(value) {
  const date = parseCalendarDate(value);
  if (!date) return { month: '--', day: '--' };
  return {
    month: MONTHS[date.getMonth()],
    day: String(date.getDate()).padStart(2, '0'),
  };
}

/** "6:00 PM" from "18:00:00" or "18:00". */
export function formatTime(value) {
  if (!value) return PLACEHOLDER;
  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  if (!match) return String(value);

  const hours = Number(match[1]);
  const minutes = match[2];
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${suffix}`;
}

/** Normalises "18:00:00" to the "18:00" that <input type="time"> expects. */
export function toTimeInputValue(value) {
  if (!value) return '';
  const match = String(value).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : '';
}

/** Normalises any date shape to the "YYYY-MM-DD" that <input type="date"> expects. */
export function toDateInputValue(value) {
  const date = parseCalendarDate(value);
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function isPastDate(value) {
  const date = parseCalendarDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/** "just now" / "12 min ago" / "3 days ago" / "4 Oct 2025" */
export function formatRelativeTime(value) {
  if (!value) return PLACEHOLDER;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  return formatDate(date);
}

/** Up to two initials, used by avatars and club monograms. */
export function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Renders a value, or the shared placeholder when the backend has none. */
export function orPlaceholder(value) {
  if (value === null || value === undefined) return PLACEHOLDER;
  const text = String(value).trim();
  return text.length ? text : PLACEHOLDER;
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}
