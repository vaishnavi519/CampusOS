/**
 * The app's only icon set: 24×24, 1.6 stroke, round caps and joins.
 *
 * Keeping them here rather than pulling in an icon package guarantees one
 * visual family, and keeps the bundle to the handful of glyphs actually used.
 * Icons are decorative by default — pass `title` when an icon is the only
 * label for a control.
 */

const GLYPHS = {
  dashboard: (
    <>
      <path d="M4 4.8h6v5.4H4zM14 4.8h6v3.4h-6zM14 12.2h6v7h-6zM4 14.2h6v5h-6z" />
    </>
  ),
  clubs: (
    <>
      <path d="M3 21h18M5.5 21V10.5M18.5 21V10.5M12 3l9 4.6H3z" />
      <path d="M9.6 21v-6.4h4.8V21" />
    </>
  ),
  membership: (
    <>
      <path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" />
      <path d="M9.6 9.6l1.8 1.8 3.2-3.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  registrations: (
    <>
      <path d="M10 6.5h10M10 12h10M10 17.5h10" />
      <path d="M3.6 6.3l1.2 1.2 2.1-2.4M3.6 11.8l1.2 1.2 2.1-2.4M3.6 17.3l1.2 1.2 2.1-2.4" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.6c0-3.3-2.7-6-6-6s-6 2.7-6 6c0 5.6-2 7-2 7h16s-2-1.4-2-7z" />
      <path d="M10.3 19.5a2 2 0 0 0 3.4 0" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.7" />
      <path d="M5 20.2c0-3.5 3.1-5.6 7-5.6s7 2.1 7 5.6" />
    </>
  ),
  users: (
    <>
      <circle cx="9.4" cy="8.4" r="3.3" />
      <path d="M3.2 19.6c0-3.1 2.8-4.9 6.2-4.9s6.2 1.8 6.2 4.9" />
      <path d="M16.4 5.6a3.2 3.2 0 0 1 0 5.8M17.6 15.2c2 .7 3.2 2.2 3.2 4.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7.2 2.9v5.5c0 4.5-3 7.6-7.2 9.6-4.2-2-7.2-5.1-7.2-9.6V5.9z" />
      <path d="M9.4 12l1.9 1.9 3.5-3.7" />
    </>
  ),
  review: (
    <>
      <rect x="5" y="4.6" width="14" height="16.4" rx="2" />
      <path d="M9.2 3h5.6v3.2H9.2z" />
      <path d="M9.4 13l1.8 1.8 3.5-3.7" />
    </>
  ),
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="M20 20l-4.6-4.6" />
    </>
  ),
  x: <path d="M6.2 6.2l11.6 11.6M17.8 6.2L6.2 17.8" />,
  check: <path d="M5 12.6l4.6 4.6L19 6.8" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M8.2 12.2l2.6 2.6 5.2-5.4" />
    </>
  ),
  'alert-circle': (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.6v5.2M12 16.3h.01" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M12 4.2l8.6 15.2H3.4z" />
      <path d="M12 9.4v4.4M12 17h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 11.2v5.2M12 7.8h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3.1 1.9" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.2s6.8-5.7 6.8-11a6.8 6.8 0 1 0-13.6 0c0 5.3 6.8 11 6.8 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  'chevron-right': <path d="M9.4 5.2l6.8 6.8-6.8 6.8" />,
  'chevron-left': <path d="M14.6 5.2L7.8 12l6.8 6.8" />,
  'chevron-down': <path d="M5.2 9.4L12 16.2l6.8-6.8" />,
  'arrow-left': <path d="M20 12H4.4M10.4 5.8L4.2 12l6.2 6.2" />,
  'arrow-right': <path d="M4 12h15.6M13.6 5.8L19.8 12l-6.2 6.2" />,
  menu: <path d="M3.4 6.4h17.2M3.4 12h17.2M3.4 17.6h17.2" />,
  'log-out': (
    <>
      <path d="M14.6 4.2h3.2a2 2 0 0 1 2 2v11.6a2 2 0 0 1-2 2h-3.2" />
      <path d="M9.6 8.2L5.4 12l4.2 3.8M5.6 12h9.2" />
    </>
  ),
  plus: <path d="M12 5.2v13.6M5.2 12h13.6" />,
  refresh: (
    <>
      <path d="M19.8 12a7.8 7.8 0 1 1-2.3-5.5" />
      <path d="M20 4.2v4.4h-4.4" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.6 13.4h4.2l1.5 2.8h5.4l1.5-2.8h4.2" />
      <path d="M3.6 13.4l2.6-7.2h11.6l2.6 7.2v4.6a2 2 0 0 1-2 2H5.6a2 2 0 0 1-2-2z" />
    </>
  ),
  send: (
    <>
      <path d="M20.8 3.4L3.4 10.2l7.2 2.8 2.8 7.2z" />
      <path d="M20.8 3.4l-10.2 9.6" />
    </>
  ),
  broadcast: (
    <>
      <circle cx="12" cy="12" r="2.1" />
      <path d="M8.2 15.8a5.4 5.4 0 0 1 0-7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6" />
      <path d="M5.4 18.6a9.4 9.4 0 0 1 0-13.2M18.6 5.4a9.4 9.4 0 0 1 0 13.2" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />,
  pencil: (
    <>
      <path d="M4.4 19.6h4.2L19.4 8.8l-4.2-4.2L4.4 15.4z" />
      <path d="M14.2 5.6l4.2 4.2" />
    </>
  ),
  eye: (
    <>
      <path d="M2.6 12S6 5.9 12 5.9 21.4 12 21.4 12 18 18.1 12 18.1 2.6 12 2.6 12z" />
      <circle cx="12" cy="12" r="2.9" />
    </>
  ),
  filter: <path d="M3.4 5.4h17.2L14 13.4v5.4l-4 2.2v-7.6z" />,
  database: (
    <>
      <ellipse cx="12" cy="6.2" rx="7.6" ry="2.8" />
      <path d="M4.4 6.2v11.6c0 1.5 3.4 2.8 7.6 2.8s7.6-1.3 7.6-2.8V6.2" />
      <path d="M4.4 12c0 1.5 3.4 2.8 7.6 2.8s7.6-1.3 7.6-2.8" />
    </>
  ),
  'external-link': (
    <>
      <path d="M14.2 4.2h5.6v5.6M19.8 4.2l-8.4 8.4" />
      <path d="M17.6 13.6v4.2a2 2 0 0 1-2 2H6.2a2 2 0 0 1-2-2V8.4a2 2 0 0 1 2-2h4.2" />
    </>
  ),
  ticket: (
    <>
      <path d="M3.6 8.4V6.6a1.4 1.4 0 0 1 1.4-1.4h14a1.4 1.4 0 0 1 1.4 1.4v1.8a2.6 2.6 0 0 0 0 7.2v1.8a1.4 1.4 0 0 1-1.4 1.4H5a1.4 1.4 0 0 1-1.4-1.4v-1.8a2.6 2.6 0 0 0 0-7.2z" />
      <path d="M13.6 5.2v13.6" />
    </>
  ),
};

export function Icon({ name, size = 18, className, title, ...rest }) {
  const glyph = GLYPHS[name];
  if (!glyph) return null;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {glyph}
    </svg>
  );
}

export const ICON_NAMES = Object.keys(GLYPHS);
