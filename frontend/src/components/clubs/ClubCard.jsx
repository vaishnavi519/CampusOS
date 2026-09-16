import { Link } from 'react-router-dom';

import { StatusBadge } from '../ui/Badge.jsx';
import { Tag } from '../ui/Badge.jsx';
import { initials, orPlaceholder } from '../../utils/format.js';

/**
 * A club in the browse grid. Cards earn their place here: each item is a
 * self-contained thing you act on, not a row you scan.
 */
export function ClubCard({ club, to, membershipStatus, action }) {
  return (
    <article className="club-card">
      <header className="club-card__head">
        <span className="club-monogram" aria-hidden="true">
          {initials(club.name)}
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3>
            <Link className="club-card__name" to={to}>
              {club.name}
            </Link>
          </h3>
          {club.category ? (
            <div style={{ marginTop: 4 }}>
              <Tag>{club.category}</Tag>
            </div>
          ) : null}
        </div>
      </header>

      <p className="club-card__desc">
        {club.description
          ? club.description
          : 'No description has been added for this club yet.'}
      </p>

      <footer className="club-card__foot">
        {membershipStatus ? (
          <StatusBadge kind="membership" status={membershipStatus} />
        ) : null}
        <div className="spacer" />
        {action}
      </footer>
    </article>
  );
}

/** Single-line club summary used inside lists and detail sidebars. */
export function ClubSummary({ club, to }) {
  return (
    <Link className="record" to={to}>
      <span className="club-monogram" aria-hidden="true">
        {initials(club.name)}
      </span>
      <div className="record__body">
        <p className="record__title">{club.name}</p>
        <p className="record__meta">{orPlaceholder(club.category)}</p>
      </div>
    </Link>
  );
}
