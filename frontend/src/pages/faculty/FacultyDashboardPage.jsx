
import { Link } from 'react-router-dom';

import { DateChip } from '../../components/events/EventRecord.jsx';
import { Metric } from '../../components/dashboard/Metric.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Panel, PanelHeader } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAsync } from '../../hooks/index.js';
import {
  eventService,
  notificationService,
} from '../../services/index.js';
import { formatTime, orPlaceholder } from '../../utils/format.js';

export function FacultyDashboardPage() {
  const { user } = useAuth();

  const pending = useAsync(() => eventService.listPublishedEvents(), []);
  const notifications = useAsync(
    () => notificationService.listNotifications(),
    [],
  );

  const rows = pending.data ?? [];
  const unread = (notifications.data ?? []).filter(
    (row) => !row.read,
  ).length;

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? 'there'}`}
        description="Review pending club approvals and event proposals from the clubs you coordinate."
        actions={
          <div className="row-wrap">
            <Button
              to="/faculty/pending-clubs"
              variant="secondary"
            >
              Pending clubs
            </Button>

            <Button
              to="/faculty/pending"
              variant="primary"
              icon="review"
            >
              Review events
            </Button>
          </div>
        }
      />

      <div className="metric-row">
        <Metric
          value={rows.length}
          label="Events awaiting your approval"
          loading={pending.loading}
          unavailable={Boolean(pending.error)}
        />

        <Metric
          value={unread}
          label="Unread notifications"
          loading={notifications.loading}
          unavailable={Boolean(notifications.error)}
        />
      </div>

      <Panel flush>
        <PanelHeader
          title="Pending events"
          action={
            <Link className="section-head__link" to="/faculty/pending">
              View all
            </Link>
          }
        />

        <AsyncSection
          loading={pending.loading}
          error={pending.error}
          onRetry={pending.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={rows.length === 0}
          empty={
            <EmptyState
              icon="check-circle"
              title="Nothing needs your event approval"
              description="When a club submits an event, its proposal will appear here."
            />
          }
        >
          <div className="record-list">
            {rows.slice(0, 5).map((event) => (
              <Link
                className="record"
                key={event.id}
                to={`/faculty/pending/${event.id}`}
              >
                <DateChip date={event.event_date} />

                <div className="record__body">
                  <p className="record__title">{event.title}</p>

                  <p className="record__meta">
                    <span>{orPlaceholder(event.club_name)}</span>

                    <span className="record__meta-sep row" style={{ gap: 5 }}>
                      <Icon name="clock" size={13} />
                      {formatTime(event.event_time)}
                    </span>

                    <span className="record__meta-sep row" style={{ gap: 5 }}>
                      <Icon name="pin" size={13} />
                      {orPlaceholder(event.venue)}
                    </span>
                  </p>
                </div>

                <div className="record__aside">
                  <Icon
                    name="chevron-right"
                    size={16}
                    className="text-muted"
                  />
                </div>
              </Link>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
