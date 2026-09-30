import { useState } from 'react';
import { Link } from 'react-router-dom';

import { StatusBadge } from '../ui/Badge.jsx';
import { Tag } from '../ui/Badge.jsx';
import { orPlaceholder } from '../../utils/format.js';
import { generatedLogo } from '../../utils/generatedLogo.js';

/**
 * Club mark: the real logo when one is available, falling back to an
 * auto-generated monogram mark if the image fails to load or none was provided.
 */
function ClubMark({ club, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const className = size === 'lg' ? 'club-monogram club-monogram--lg' : 'club-monogram';
  const src = club.logo_url && !failed ? club.logo_url : generatedLogo(club.name);

  return (
    <span className={className} aria-hidden="true">
      <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
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
