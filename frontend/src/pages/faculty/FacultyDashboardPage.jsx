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
import { eventService, notificationService } from '../../services/index.js';
import { formatTime, orPlaceholder } from '../../utils/format.js';

/** The faculty coordinator's queue: events submitted and waiting on a decision. */
export function FacultyDashboardPage() {
  const { user } = useAuth();

  const pending = useAsync(() => eventService.listPendingEvents(), []);
  const notifications = useAsync(
    () => notificationService.listNotifications(),
    [],
  );

  const rows = pending.data ?? [];
  const unread = (notifications.data ?? []).filter((row) => !row.read).length;

  const firstName = user?.name?.split(' ').slice(-1)[0] ?? 'there';

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.name ?? firstName}`}
        description="Event proposals from the clubs you coordinate, waiting on your decision."
        actions={
          rows.length > 0 ? (
            <Button to="/faculty/pending" variant="primary" icon="review">
              Review queue
            </Button>
          ) : null
        }
      />

      <div className="metric-row">
        <Metric
          value={rows.length}
          label="Awaiting your approval"
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
            rows.length > 0 ? (
              <Link className="section-head__link" to="/faculty/pending">
                View all
              </Link>
            ) : null
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
              title="Nothing needs your approval"
              description="When a club submits an event you will find it here with its full proposal."
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
                  <Icon name="chevron-right" size={16} className="text-muted" />
                </div>
              </Link>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
