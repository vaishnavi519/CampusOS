import { useState } from 'react';

import { DateChip } from '../../components/events/EventRecord.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { eventService } from '../../services/index.js';
import {
  formatDateLong,
  formatTime,
  orPlaceholder,
} from '../../utils/format.js';

/**
 * The publication queue: faculty-approved events, and the final
 * PATCH /api/events/:id/publish that makes them visible to students.
 */
export function ApprovedEventsPage() {
  const toast = useToast();
  const [pendingPublish, setPendingPublish] = useState(null);
  const [working, setWorking] = useState(false);

  const approved = useAsync(() => eventService.listApprovedEvents(), []);
  const rows = approved.data ?? [];

  const publish = async () => {
    setWorking(true);
    try {
      await eventService.publishEvent(pendingPublish.id);
      toast.success(`${pendingPublish.title} is now on the campus calendar.`);
      setPendingPublish(null);
      await approved.refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Approved events"
        description="Publishing an event makes it visible to every student and opens registration."
      />

      <Panel flush>
        <AsyncSection
          loading={approved.loading}
          error={approved.error}
          onRetry={approved.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={rows.length === 0}
          empty={
            <EmptyState
              icon="broadcast"
              title="Nothing ready to publish"
              description="Once a faculty coordinator approves an event it will appear here for release."
            />
          }
        >
          <div className="record-list">
            {rows.map((event) => (
              <div className="record" key={event.id}>
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
                  <p className="record__meta">
                    <span>{formatDateLong(event.event_date)}</span>
                    <span className="record__meta-sep">
                      {orPlaceholder(event.capacity)} seats
                    </span>
                  </p>
                </div>

                <div className="record__aside row-wrap">
                  <StatusBadge kind="event" status={event.status} />
                  <Button
                    size="sm"
                    variant="primary"
                    icon="broadcast"
                    onClick={() => setPendingPublish(event)}
                  >
                    Publish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingPublish)}
        onClose={() => setPendingPublish(null)}
        onConfirm={publish}
        loading={working}
        title="Publish this event?"
        description={
          pendingPublish
            ? `${pendingPublish.title} will become visible to all students and registration will open immediately.`
            : ''
        }
        confirmLabel="Publish to calendar"
        cancelLabel="Not yet"
      />
    </>
  );
}
