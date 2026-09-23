import { Metric } from '../../components/dashboard/Metric.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Panel, PanelBody, PanelHeader } from '../../components/ui/Panel.jsx';
import { AsyncSection, ListSkeleton } from '../../components/ui/States.jsx';
import { useAsync } from '../../hooks/index.js';
import { statsService } from '../../services/index.js';

/**
 * GET /api/stats/platform.
 *
 * Every figure is read straight from the endpoint. Nothing is derived, so the
 * page can never disagree with the backend's own count.
 */

const FIGURES = [
  {
    key: 'total_users',
    label: 'Registered accounts',
    hint: 'Students, club admins, faculty and administrators',
  },
  { key: 'total_clubs', label: 'Clubs', hint: 'Across all categories' },
  { key: 'total_events', label: 'Events', hint: 'Every status, not only published' },
  {
    key: 'total_registrations',
    label: 'Event registrations',
    hint: 'Seats taken across all events',
  },
  {
    key: 'total_attendance',
    label: 'Attendance records',
    hint: 'Marked by the organising clubs',
  },
];

export function PlatformStatsPage() {
  const stats = useAsync(() => statsService.getPlatformStats(), []);
  const failed = Boolean(stats.error);

  const attendanceRate =
    stats.data && stats.data.total_registrations > 0
      ? `${Math.round(
          (stats.data.total_attendance / stats.data.total_registrations) * 100,
        )}%`
      : null;

  return (
    <>
      <PageHeader
        title="Platform statistics"
        description="Campus-wide usage, reported by the backend."
        actions={
          <Button icon="refresh" onClick={stats.refetch} loading={stats.loading}>
            Refresh
          </Button>
        }
      />

      <div className="metric-row">
        {FIGURES.map((figure) => (
          <Metric
            key={figure.key}
            value={stats.data?.[figure.key]}
            label={figure.label}
            hint={figure.hint}
            loading={stats.loading}
            unavailable={failed}
          />
        ))}
      </div>

      <Panel>
        <PanelHeader title="Engagement" />
        <PanelBody>
          <AsyncSection
            loading={stats.loading}
            error={stats.error}
            onRetry={stats.refetch}
            skeleton={<ListSkeleton rows={1} />}
          >
            <p style={{ fontSize: 'var(--fs-15)' }}>
              {attendanceRate
                ? `${attendanceRate} of registrations have an attendance record against them.`
                : 'No registrations have been recorded yet, so there is no attendance rate to report.'}
            </p>
            <p
              className="text-secondary"
              style={{ fontSize: 'var(--fs-14)', marginTop: 'var(--sp-2)', maxWidth: '66ch' }}
            >
              An attendance record is created when a club marks a registered
              student present or absent. Events that have not happened yet will
              not have one.
            </p>
          </AsyncSection>
        </PanelBody>
      </Panel>
    </>
  );
}
