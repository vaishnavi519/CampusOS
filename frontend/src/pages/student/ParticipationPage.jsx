import { Link } from 'react-router-dom';

import { DateChip } from '../../components/events/EventRecord.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { Metric } from '../../components/dashboard/Metric.jsx';
import { useAsync } from '../../hooks/index.js';
import { reportService } from '../../services/index.js';
import { formatTime, orPlaceholder } from '../../utils/format.js';

/**
 * GET /api/reports/my-participation — the student's own attendance record.
 *
 * Both totals come straight from the API's `summary`; nothing on this page
 * re-counts them on the client, so the figures cannot drift from the backend.
 */
export function ParticipationPage() {
  const participation = useAsync(() => reportService.getMyParticipation(), []);

  const summary = participation.data?.summary;
  const rows = participation.data?.report ?? [];
  const failed = Boolean(participation.error);

  const attendanceRate =
    summary && summary.total_registered > 0
      ? `${Math.round((summary.total_attended / summary.total_registered) * 100)}%`
      : null;

  return (
    <>
      <PageHeader
        title="My participation"
        description="Every event you registered for, and whether the organising club marked you present."
        actions={
          <Button to="/app/registrations" icon="ticket">
            My registrations
          </Button>
        }
      />

      <div className="metric-row">
        <Metric
          value={summary?.total_registered}
          label="Events registered"
          loading={participation.loading}
          unavailable={failed}
        />
        <Metric
          value={summary?.total_attended}
          label="Events attended"
          loading={participation.loading}
          unavailable={failed}
        />
        <Metric
          value={attendanceRate}
          label="Attendance rate"
          loading={participation.loading}
          unavailable={failed}
        />
      </div>

      <Panel flush>
        <AsyncSection
          loading={participation.loading}
          error={participation.error}
          onRetry={participation.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={rows.length === 0}
          empty={
            <EmptyState
              icon="chart"
              title="Nothing to report yet"
              description="Register for an event and your participation record will build up here."
              action={
                <Button variant="primary" to="/app/events">
                  Browse events
                </Button>
              }
            />
          }
        >
          <div className="record-list">
            {rows.map((row) => (
              <div className="record" key={row.event_id}>
                <DateChip date={row.event_date} />

                <div className="record__body">
                  <p className="record__title">
                    <Link to={`/app/events/${row.event_id}`}>
                      {orPlaceholder(row.title)}
                    </Link>
                  </p>
                  <p className="record__meta">
                    {row.event_time ? (
                      <span className="row" style={{ gap: 5 }}>
                        <Icon name="clock" size={13} />
                        {formatTime(row.event_time)}
                      </span>
                    ) : null}
                    {row.venue ? (
                      <span className="record__meta-sep row" style={{ gap: 5 }}>
                        <Icon name="pin" size={13} />
                        {row.venue}
                      </span>
                    ) : null}
                    {row.club_name ? (
                      <span className="record__meta-sep">{row.club_name}</span>
                    ) : null}
                  </p>
                </div>

                <div className="record__aside row-wrap">
                  {row.registration_status ? (
                    <StatusBadge
                      kind="registration"
                      status={row.registration_status}
                    />
                  ) : null}
                  <StatusBadge kind="attendance" status={row.attendance_status} />
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
