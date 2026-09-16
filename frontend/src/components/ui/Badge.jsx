import { Icon } from './Icon.jsx';
import { STATUS_KINDS } from '../../utils/status.js';

const GLYPH_ICONS = {
  check: 'check',
  clock: 'clock',
  cross: 'x',
  broadcast: 'broadcast',
  dot: 'dot',
};

export function Badge({ tone = 'neutral', glyph, children, className, ...rest }) {
  return (
    <span
      className={['badge', tone !== 'neutral' ? `badge--${tone}` : '', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {glyph ? (
        <Icon
          name={GLYPH_ICONS[glyph] ?? 'dot'}
          size={glyph === 'dot' ? 8 : 12}
          className="badge__glyph"
        />
      ) : null}
      {children}
    </span>
  );
}

/**
 * Renders a domain status. The glyph carries the same information as the
 * colour, so status is legible without colour vision.
 *
 * @param {'event'|'membership'|'registration'} kind
 */
export function StatusBadge({ kind, status, className }) {
  const descriptor = (STATUS_KINDS[kind] ?? STATUS_KINDS.event)(status);

  return (
    <Badge tone={descriptor.tone} glyph={descriptor.glyph} className={className}>
      {descriptor.label}
    </Badge>
  );
}

export function Tag({ children, className }) {
  return (
    <span className={['tag', className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
