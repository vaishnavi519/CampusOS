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
import { useAsync } from '../../hooks/index.js';
import { eventService } from '../../services/index.js';
import { formatTime, orPlaceholder } from '../../utils/format.js';

/** GET /api/events/pending — the full approval queue. */
export function PendingEventsPage() {
  const pending = useAsync(() => eventService.listPendingEvents(), []);
  const rows = pending.data ?? [];

  return (
    <>
      <PageHeader
        title="Pending events"
        description="Open an event to read its proposal, then approve it or return it with a reason."
      />

      <Panel flush>
        <AsyncSection
          loading={pending.loading}
          error={pending.error}
          onRetry={pending.refetch}
          skeleton={<ListSkeleton rows={4} />}
          isEmpty={rows.length === 0}
          empty={
            <EmptyState
              icon="check-circle"
              title="The queue is empty"
              description="Every submitted event has been decided. New submissions will appear here."
            />
          }
        >
          <div className="record-list">
            {rows.map((event) => (
              <div className="record" key={event.id}>
                <DateChip date={event.event_date} />

                <div className="record__body">
                  <p className="record__title">
                    <Link to={`/faculty/pending/${event.id}`}>{event.title}</Link>
                  </p>
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
                  {event.description ? (
                    <p className="record__excerpt">{event.description}</p>
                  ) : null}
                </div>

                <div className="record__aside row-wrap">
                  <StatusBadge kind="event" status={event.status} />
                  <Button
                    size="sm"
                    variant="primary"
                    to={`/faculty/pending/${event.id}`}
                  >
                    Review
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
