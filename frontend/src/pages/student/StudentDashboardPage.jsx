import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { DateChip, EventRecord } from '../../components/events/EventRecord.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Panel, PanelBody, PanelHeader } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
  PendingBackendNotice,
} from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/index.js';
import {
  clubService,
  eventService,
  notificationService,
  registrationService,
} from '../../services/index.js';
import { NotImplementedError } from '../../services/errors.js';
import {
  MEMBERSHIP_STATUS,
  REGISTRATION_STATUS,
} from '../../utils/constants.js';
import {
  formatDate,
  formatRelativeTime,
  formatTime,
  isPastDate,
  orPlaceholder,
} from '../../utils/format.js';

/**
 * Operational dashboard: what the student has coming up, what they are waiting
 * on, and what changed recently. Every number is counted from data on screen —
 * there are no decorative statistics.
 */
export function StudentDashboardPage() {
  const { user } = useAuth();

  const registrations = useAsync(
    () => registrationService.listMyRegistrations(),
    [],
  );
  const memberships = useAsync(() => clubService.listMyMemberships(), []);
  const events = useAsync(() => eventService.listPublishedEvents(), []);
  const notifications = useAsync(
    () => notificationService.listNotifications(),
    [],
  );

  const upcoming = useMemo(
    () =>
      (registrations.data ?? []).filter(
        (row) =>
          row.status !== REGISTRATION_STATUS.CANCELLED &&
          !isPastDate(row.event_date),
      ),
    [registrations.data],
  );

  const approvedClubs = useMemo(
    () =>
      (memberships.data ?? []).filter(
        (row) => row.status === MEMBERSHIP_STATUS.APPROVED,
      ),
    [memberships.data],
  );

  const pendingRequests = useMemo(
    () =>
      (memberships.data ?? []).filter(
        (row) => row.status === MEMBERSHIP_STATUS.PENDING,
      ),
    [memberships.data],
  );

  const registeredIds = useMemo(
    () =>
      new Set(
        (registrations.data ?? [])
          .filter((row) => row.status !== REGISTRATION_STATUS.CANCELLED)
          .map((row) => row.event_id),
      ),
    [registrations.data],
  );

  const openEvents = useMemo(
    () =>
      (events.data ?? [])
        .filter(
          (event) =>
            !isPastDate(event.event_date) && !registeredIds.has(event.id),
        )
        .slice(0, 4),
    [events.data, registeredIds],
  );

  const recentNotifications = (notifications.data ?? []).slice(0, 4);
  const unread = (notifications.data ?? []).filter((row) => !row.read).length;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description="Your clubs, registrations and anything waiting on you."
      />

      <div className="metric-row">
        <Metric
          value={upcoming.length}
          label="Upcoming events"
          loading={registrations.loading}
          unavailable={registrations.error instanceof NotImplementedError}
        />
        <Metric
          value={approvedClubs.length}
          label="Club memberships"
          loading={memberships.loading}
        />
        <Metric
          value={pendingRequests.length}
          label="Requests pending"
          loading={memberships.loading}
        />
        <Metric
          value={unread}
          label="Unread notifications"
          loading={notifications.loading}
          unavailable={notifications.error instanceof NotImplementedError}
        />
      </div>

      <div className="dash-grid">
        <div className="stack">
          <Panel flush>
            <PanelHeader
              title="Your next events"
              action={
                upcoming.length > 0 ? (
                  <Link className="section-head__link" to="/app/registrations">
                    All registrations
                  </Link>
                ) : null
              }
            />
            <AsyncSection
              loading={registrations.loading}
              error={registrations.error}
              onRetry={registrations.refetch}
              skeleton={<ListSkeleton rows={2} />}
              isEmpty={upcoming.length === 0}
              empty={
                <EmptyState
                  icon="ticket"
                  title="Nothing coming up"
                  description="You are not registered for any upcoming events."
                  action={
                    <Button variant="primary" to="/app/events">
                      Browse events
                    </Button>
                  }
                />
              }
            >
              <div className="record-list">
                {upcoming.slice(0, 4).map((row) => (
                  <div className="record" key={row.registration_id}>
                    <DateChip date={row.event_date} />
                    <div className="record__body">
                      <p className="record__title">
                        <Link to={`/app/events/${row.event_id}`}>{row.title}</Link>
                      </p>
                      <p className="record__meta">
                        <span className="row" style={{ gap: 5 }}>
                          <Icon name="clock" size={13} />
                          {formatTime(row.event_time)}
                        </span>
                        <span className="record__meta-sep row" style={{ gap: 5 }}>
                          <Icon name="pin" size={13} />
                          {orPlaceholder(row.venue)}
                        </span>
                      </p>
                    </div>
                    <div className="record__aside">
                      <StatusBadge kind="registration" status={row.status} />
                    </div>
                  </div>
                ))}
              </div>
            </AsyncSection>
          </Panel>

          <Panel flush>
            <PanelHeader
              title="Open for registration"
              action={
                <Link className="section-head__link" to="/app/events">
                  All events
                </Link>
              }
            />
            <AsyncSection
              loading={events.loading}
              error={events.error}
              onRetry={events.refetch}
              skeleton={<ListSkeleton rows={3} />}
              isEmpty={openEvents.length === 0}
              empty={
                <EmptyState
                  icon="calendar"
                  title="No other published events"
                  description="You have already registered for everything that is open."
                />
              }
            >
              <div className="record-list">
                {openEvents.map((event) => (
                  <EventRecord
                    key={event.id}
                    event={event}
                    to={`/app/events/${event.id}`}
                  />
                ))}
              </div>
            </AsyncSection>
          </Panel>
        </div>

        <div className="stack">
          <Panel flush>
            <PanelHeader
              title="Membership requests"
              action={
                <Link className="section-head__link" to="/app/my-clubs">
                  My clubs
                </Link>
              }
            />
            <AsyncSection
              loading={memberships.loading}
              error={memberships.error}
              onRetry={memberships.refetch}
              skeleton={<ListSkeleton rows={2} />}
              isEmpty={pendingRequests.length === 0}
              empty={
                <EmptyState
                  icon="membership"
                  title="No requests waiting"
                  description={
                    approvedClubs.length > 0
                      ? `You are a member of ${approvedClubs.length} club${approvedClubs.length === 1 ? '' : 's'}.`
                      : 'Browse clubs to send your first membership request.'
                  }
                  action={
                    approvedClubs.length === 0 ? (
                      <Button to="/app/clubs">Browse clubs</Button>
                    ) : null
                  }
                />
              }
            >
              <div className="record-list">
                {pendingRequests.map((row) => (
                  <Link
                    className="record"
                    key={row.membership_id}
                    to={`/app/clubs/${row.club_id}`}
                  >
                    <div className="record__body">
                      <p className="record__title">{row.name}</p>
                      <p className="record__meta">
                        Requested {formatDate(row.applied_at)}
                      </p>
                    </div>
                    <div className="record__aside">
                      <StatusBadge kind="membership" status={row.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </AsyncSection>
          </Panel>

          <Panel flush>
            <PanelHeader
              title="Recent activity"
              action={
                <Link className="section-head__link" to="/app/notifications">
                  All notifications
                </Link>
              }
            />
            {notifications.error instanceof NotImplementedError ? (
              <PanelBody>
                <PendingBackendNotice error={notifications.error} />
              </PanelBody>
            ) : (
              <AsyncSection
                loading={notifications.loading}
                error={notifications.error}
                onRetry={notifications.refetch}
                skeleton={<ListSkeleton rows={3} />}
                isEmpty={recentNotifications.length === 0}
                empty={
                  <EmptyState
                    icon="bell"
                    title="Nothing new"
                    description="Updates about your clubs and events will appear here."
                  />
                }
              >
                <div className="record-list">
                  {recentNotifications.map((item) => (
                    <Link
                      className="record"
                      key={item.id}
                      to={item.link ?? '/app/notifications'}
                    >
                      <div className="record__body">
                        <p
                          className="record__title"
                          style={{
                            fontSize: 'var(--fs-14)',
                            fontWeight: item.read ? 400 : 600,
                          }}
                        >
                          {item.title}
                        </p>
                        <p className="record__meta">
                          {formatRelativeTime(item.created_at)}
                          {item.read ? null : (
                            <span className="record__meta-sep">Unread</span>
                          )}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </AsyncSection>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

function Metric({ value, label, loading, unavailable }) {
  return (
    <div className="metric">
      <p className="metric__value">
        {loading ? (
          <span className="skeleton" style={{ display: 'block', width: 38, height: 26 }} />
        ) : unavailable ? (
          <span className="text-muted" style={{ fontSize: 'var(--fs-18)' }}>
            —
          </span>
        ) : (
          value
        )}
      </p>
      <p className="metric__label">{label}</p>
    </div>
  );
}
