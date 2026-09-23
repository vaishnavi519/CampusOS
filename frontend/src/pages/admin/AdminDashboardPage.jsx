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
import { useAsync } from '../../hooks/index.js';
import { eventService, statsService } from '../../services/index.js';
import { formatTime, orPlaceholder } from '../../utils/format.js';

/** Platform overview plus the publication queue. */
export function AdminDashboardPage() {
  const stats = useAsync(() => statsService.getPlatformStats(), []);
  const approved = useAsync(() => eventService.listApprovedEvents(), []);

  const rows = approved.data ?? [];
  const statsFailed = Boolean(stats.error);

  return (
    <>
      <PageHeader
        title="Platform overview"
        description="Campus-wide totals and the events approved by faculty but not yet published."
        actions={
          <Button to="/admin/statistics" icon="chart">
            Full statistics
          </Button>
        }
      />

      <div className="metric-row">
        <Metric
          value={stats.data?.total_users}
          label="Accounts"
          loading={stats.loading}
          unavailable={statsFailed}
        />
        <Metric
          value={stats.data?.total_clubs}
          label="Clubs"
          loading={stats.loading}
          unavailable={statsFailed}
        />
        <Metric
          value={stats.data?.total_events}
          label="Events"
          loading={stats.loading}
          unavailable={statsFailed}
        />
        <Metric
          value={rows.length}
          label="Ready to publish"
          loading={approved.loading}
          unavailable={Boolean(approved.error)}
        />
      </div>

      <Panel flush>
        <PanelHeader
          title="Approved, awaiting publication"
          action={
            rows.length > 0 ? (
              <Link className="section-head__link" to="/admin/approved">
                View all
              </Link>
            ) : null
          }
        />
        <AsyncSection
          loading={approved.loading}
          error={approved.error}
          onRetry={approved.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={rows.length === 0}
          empty={
            <EmptyState
              icon="broadcast"
              title="Nothing waiting to publish"
              description="Faculty-approved events appear here for release to the campus calendar."
            />
          }
        >
          <div className="record-list">
            {rows.slice(0, 5).map((event) => (
              <Link className="record" key={event.id} to="/admin/approved">
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
