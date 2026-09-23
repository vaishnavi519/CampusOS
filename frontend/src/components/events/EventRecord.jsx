import { Link } from 'react-router-dom';

import { Cover } from '../ui/Cover.jsx';
import { Icon } from '../ui/Icon.jsx';
import { StatusBadge } from '../ui/Badge.jsx';
import {
  dateChipParts,
  formatTime,
  isPastDate,
  orPlaceholder,
} from '../../utils/format.js';

/** Compact calendar marker. Dimmed once the date has passed. */
export function DateChip({ date }) {
  const { month, day } = dateChipParts(date);
  const past = isPastDate(date);

  return (
    <div
      className={['date-chip', past ? 'date-chip--past' : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <div className="date-chip__month">{month}</div>
      <div className="date-chip__day">{day}</div>
    </div>
  );
}

/**
 * One event in a list. The whole row is the link, so the target is large
 * enough on touch.
 *
 * @param {object} props.event      Event row from the API.
 * @param {string} props.to         Route for the detail screen.
 * @param {boolean} [props.showStatus]  Show lifecycle status (staff screens).
 * @param {boolean} [props.showCover]   Lead the row with generated cover art.
 * @param {React.ReactNode} [props.aside]  Trailing content, e.g. a badge.
 */
export function EventRecord({
  event,
  to,
  showStatus = false,
  showCover = true,
  aside,
}) {
  return (
    <Link className="record" to={to}>
      {showCover ? (
        <span className="record__thumb">
          <Cover name={event.title} />
        </span>
      ) : null}
      <DateChip date={event.event_date} />

      <div className="record__body">
        <p className="record__title">{event.title}</p>

        <p className="record__meta">
          <span className="row" style={{ gap: 5 }}>
            <Icon name="clock" size={13} />
            {formatTime(event.event_time)}
          </span>
          <span className="record__meta-sep row" style={{ gap: 5 }}>
            <Icon name="pin" size={13} />
            {orPlaceholder(event.venue)}
          </span>
          {event.club_name ? (
            <span className="record__meta-sep">{event.club_name}</span>
          ) : null}
        </p>
      </div>

      <div className="record__aside">
        {aside}
        {showStatus ? <StatusBadge kind="event" status={event.status} /> : null}
        <Icon name="chevron-right" size={16} className="text-muted" />
      </div>
    </Link>
  );
}
