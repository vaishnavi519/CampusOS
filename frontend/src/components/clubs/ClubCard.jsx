import { useState } from 'react';
import { Link } from 'react-router-dom';

import { StatusBadge } from '../ui/Badge.jsx';
import { Tag } from '../ui/Badge.jsx';
import { initials, orPlaceholder } from '../../utils/format.js';

/**
 * Club mark: the real logo when one is available, falling back to a
 * monogram if the image fails to load or none was provided.
 */
function ClubMark({ club, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const className = size === 'lg' ? 'club-monogram club-monogram--lg' : 'club-monogram';

  if (club.logo_url && !failed) {
    return (
      <span className={className} aria-hidden="true">
        <img
          src={club.logo_url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={className} aria-hidden="true">
      {initials(club.name)}
    </span>
  );
}

/**
 * A club in the browse grid. Cards earn their place here: each item is a
 * self-contained thing you act on, not a row you scan.
 */
export function ClubCard({ club, to, membershipStatus, action }) {
  return (
    <article className="club-card">
      <header className="club-card__head">
        <ClubMark club={club} />
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
      <ClubMark club={club} />
      <div className="record__body">
        <p className="record__title">{club.name}</p>
        <p className="record__meta">{orPlaceholder(club.category)}</p>
      </div>
    </Link>
  );
}

export { ClubMark };
