import { Link } from 'react-router-dom';

import { DateChip } from '../../components/events/EventRecord.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { useAsync } from '../../hooks/index.js';
import { recommendationService } from '../../services/index.js';
import { formatTime, orPlaceholder } from '../../utils/format.js';

/** GET /api/recommendations — events suggested for the signed-in student. */
export function RecommendationsPage() {
  const recommendations = useAsync(
    () => recommendationService.listRecommendations(),
    [],
  );

  const rows = recommendations.data ?? [];

  return (
    <>
      <PageHeader
        title="Recommended for you"
        description="Events picked from your club memberships and what you have attended before."
        actions={
          <Button to="/app/events" icon="calendar">
            All events
          </Button>
        }
      />

      <Panel flush>
        <AsyncSection
          loading={recommendations.loading}
          error={recommendations.error}
          onRetry={recommendations.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={rows.length === 0}
          empty={
            <EmptyState
              icon="sparkle"
              title="No recommendations yet"
              description="Join a club or register for an event and suggestions will start appearing here."
              action={
                <Button variant="primary" to="/app/clubs">
                  Browse clubs
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
                  {row.reason ? <p className="record__meta">{row.reason}</p> : null}
                </div>

                <div className="record__aside">
                  <Button size="sm" to={`/app/events/${row.event_id}`}>
                    View event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
