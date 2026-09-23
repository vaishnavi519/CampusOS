import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { Metric } from '../../components/dashboard/Metric.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Panel, PanelHeader } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { clubService, eventService } from '../../services/index.js';
import { NotImplementedError } from '../../services/errors.js';
import { EVENT_STATUS } from '../../utils/constants.js';
import { formatDate, formatTime, initials } from '../../utils/format.js';

/**
 * What a club administrator has waiting on them: membership requests to
 * review, drafts to submit, and events that came back from faculty.
 */
export function ClubAdminDashboardPage() {
  const { user } = useAuth();

  const clubs = useAsync(() => clubService.listAdminClubs(), []);
  const events = useAsync(() => eventService.listClubAdminEvents(), []);

  const rows = useMemo(() => clubs.data ?? [], [clubs.data]);
  const eventRows = useMemo(() => events.data ?? [], [events.data]);

  const pendingMembers = rows.reduce(
    (total, club) => total + (club.pending_count ?? 0),
    0,
  );
  const members = rows.reduce(
    (total, club) => total + (club.member_count ?? 0),
    0,
  );
  const drafts = eventRows.filter((row) => row.status === EVENT_STATUS.DRAFT);
  const rejected = eventRows.filter(
    (row) => row.status === EVENT_STATUS.REJECTED,
  );

  const clubsUnavailable = clubs.error instanceof NotImplementedError;
  const eventsUnavailable = events.error instanceof NotImplementedError;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Your clubs, their membership requests, and where each event stands."
        actions={
          <Button to="/club-admin/events" variant="primary" icon="plus">
            New event
          </Button>
        }
      />

      <div className="metric-row">
        <Metric
          value={rows.length}
          label="Clubs you administer"
          loading={clubs.loading}
          unavailable={clubsUnavailable}
        />
        <Metric
          value={members}
          label="Approved members"
          loading={clubs.loading}
          unavailable={clubsUnavailable}
        />
        <Metric
          value={pendingMembers}
          label="Requests to review"
          loading={clubs.loading}
          unavailable={clubsUnavailable}
        />
        <Metric
          value={drafts.length}
          label="Drafts to submit"
          loading={events.loading}
          unavailable={eventsUnavailable}
        />
      </div>

      <div className="dash-grid">
        <Panel flush>
          <PanelHeader
            title="Your clubs"
            action={
              <Link className="section-head__link" to="/club-admin/clubs">
                Manage clubs
              </Link>
            }
          />
          <AsyncSection
            loading={clubs.loading}
            error={clubs.error}
            onRetry={clubs.refetch}
            skeleton={<ListSkeleton rows={2} />}
            isEmpty={rows.length === 0}
            empty={
              <EmptyState
                icon="clubs"
                title="No clubs yet"
                description="Create a club to start organising events and accepting members."
                action={
                  <Button variant="primary" to="/club-admin/clubs">
                    Create a club
                  </Button>
                }
              />
            }
          >
            <div className="record-list">
              {rows.map((club) => (
                <Link
                  className="record"
                  key={club.id}
                  to={`/club-admin/clubs/${club.id}/members`}
                >
                  <span className="club-monogram" aria-hidden="true">
                    {initials(club.name)}
                  </span>
                  <div className="record__body">
                    <p className="record__title">{club.name}</p>
                    <p className="record__meta">
                      <span>{club.category}</span>
                      <span className="record__meta-sep">
                        {club.member_count} members
                      </span>
                    </p>
                  </div>
                  <div className="record__aside">
                    {club.pending_count > 0 ? (
                      <span className="badge badge--warning">
                        {club.pending_count} pending
                      </span>
                    ) : (
                      <span className="text-muted" style={{ fontSize: 'var(--fs-13)' }}>
                        Up to date
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </AsyncSection>
        </Panel>

        <Panel flush>
          <PanelHeader
            title="Events needing attention"
            action={
              <Link className="section-head__link" to="/club-admin/events">
                All events
              </Link>
            }
          />
          <AsyncSection
            loading={events.loading}
            error={events.error}
            onRetry={events.refetch}
            skeleton={<ListSkeleton rows={2} />}
            isEmpty={drafts.length + rejected.length === 0}
            empty={
              <EmptyState
                icon="check-circle"
                title="Nothing waiting on you"
                description="Every event is either submitted, approved or published."
              />
            }
          >
            <div className="record-list">
              {[...drafts, ...rejected].map((event) => (
                <Link
                  className="record"
                  key={event.id}
                  to={`/club-admin/events/${event.id}/registrations`}
                >
                  <div className="record__body">
                    <p className="record__title">{event.title}</p>
                    <p className="record__meta">
                      <span>{event.club_name}</span>
                      <span className="record__meta-sep">
                        {formatDate(event.event_date)} at{' '}
                        {formatTime(event.event_time)}
                      </span>
                    </p>
                    {event.rejection_reason ? (
                      <p className="record__meta">
                        Returned: {event.rejection_reason}
                      </p>
                    ) : null}
                  </div>
                  <div className="record__aside">
                    <StatusBadge kind="event" status={event.status} />
                  </div>
                </Link>
              ))}
            </div>
          </AsyncSection>
        </Panel>
      </div>
    </>
  );
}
