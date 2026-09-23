import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { DateChip } from '../../components/events/EventRecord.jsx';
import { EventForm } from '../../components/events/EventForm.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Panel, PanelBody, PanelHeader } from '../../components/ui/Panel.jsx';
import {
  Alert,
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { Tabs } from '../../components/ui/Toolbar.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { clubService, eventService } from '../../services/index.js';
import { EVENT_STATUS } from '../../utils/constants.js';
import { formatTime, orPlaceholder } from '../../utils/format.js';

const TABS = [
  { value: 'all', label: 'All' },
  { value: EVENT_STATUS.DRAFT, label: 'Drafts' },
  { value: EVENT_STATUS.PENDING_APPROVAL, label: 'Awaiting approval' },
  { value: EVENT_STATUS.APPROVED, label: 'Approved' },
  { value: EVENT_STATUS.PUBLISHED, label: 'Published' },
  { value: EVENT_STATUS.REJECTED, label: 'Returned' },
];

/**
 * A club admin's events across every status, plus event creation and the
 * DRAFT -> PENDING_APPROVAL submission step (PATCH /api/events/:id/submit).
 */
export function ManageEventsPage() {
  const toast = useToast();

  const [tab, setTab] = useState('all');
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(null);
  const [working, setWorking] = useState(false);

  const clubs = useAsync(() => clubService.listAdminClubs(), []);
  const events = useAsync(() => eventService.listClubAdminEvents(), []);

  const rows = useMemo(() => events.data ?? [], [events.data]);

  const counts = useMemo(() => {
    const result = { all: rows.length };
    for (const item of TABS.slice(1)) {
      result[item.value] = rows.filter((row) => row.status === item.value).length;
    }
    return result;
  }, [rows]);

  const visible =
    tab === 'all' ? rows : rows.filter((row) => row.status === tab);

  const create = async (payload) => {
    setSubmitting(true);
    try {
      const event = await eventService.createEvent(payload);
      toast.success(
        `${event?.title ?? 'The event'} was saved as a draft. Submit it when the details are final.`,
      );
      setCreating(false);
      events.refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitForApproval = async () => {
    setWorking(true);
    try {
      await eventService.submitEvent(pendingSubmit.id);
      toast.success(
        `${pendingSubmit.title} was sent to the faculty coordinator.`,
      );
      setPendingSubmit(null);
      await events.refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My events"
        description="Every event for the clubs you administer, at each stage of approval."
        actions={
          <Button
            variant={creating ? 'secondary' : 'primary'}
            icon={creating ? undefined : 'plus'}
            onClick={() => setCreating((value) => !value)}
          >
            {creating ? 'Close' : 'New event'}
          </Button>
        }
      />

      {creating ? (
        <Panel style={{ marginBottom: 'var(--sp-5)' }}>
          <PanelHeader title="Create an event" />
          <PanelBody>
            <EventForm
              clubs={clubs.data ?? []}
              submitting={submitting}
              onSubmit={create}
              onCancel={() => setCreating(false)}
            />
          </PanelBody>
        </Panel>
      ) : null}

      {rows.length > 0 ? (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Tabs
            label="Filter events by status"
            value={tab}
            onChange={setTab}
            items={TABS.map((item) => ({
              ...item,
              count: counts[item.value] ?? 0,
            }))}
          />
        </div>
      ) : null}

      <Panel flush>
        <AsyncSection
          loading={events.loading}
          error={events.error}
          onRetry={events.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={visible.length === 0}
          empty={
            rows.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No events yet"
                description="Create an event for one of your clubs to start the approval workflow."
                action={
                  <Button variant="primary" onClick={() => setCreating(true)}>
                    Create an event
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon="filter"
                title="Nothing in this tab"
                description="Choose another status to see the rest of your events."
              />
            )
          }
        >
          <div className="record-list">
            {visible.map((event) => (
              <div className="record" key={event.id}>
                <DateChip date={event.event_date} />

                <div className="record__body">
                  <p className="record__title">
                    <Link to={`/club-admin/events/${event.id}/registrations`}>
                      {event.title}
                    </Link>
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
                  <p className="record__meta">
                    <span>
                      {event.registration_count ?? 0} registered of{' '}
                      {orPlaceholder(event.capacity)}
                    </span>
                  </p>
                  {event.status === EVENT_STATUS.REJECTED &&
                  event.rejection_reason ? (
                    <Alert tone="danger" className="alert--inline">
                      Returned by faculty: {event.rejection_reason}
                    </Alert>
                  ) : null}
                </div>

                <div className="record__aside row-wrap">
                  <StatusBadge kind="event" status={event.status} />
                  {event.status === EVENT_STATUS.DRAFT ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setPendingSubmit(event)}
                    >
                      Submit
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    to={`/club-admin/events/${event.id}/registrations`}
                  >
                    Registrations
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingSubmit)}
        onClose={() => setPendingSubmit(null)}
        onConfirm={submitForApproval}
        loading={working}
        title="Submit this event for approval?"
        description={
          pendingSubmit
            ? `${pendingSubmit.title} will be sent to the faculty coordinator and can no longer be edited as a draft.`
            : ''
        }
        confirmLabel="Submit for approval"
        cancelLabel="Keep as draft"
      />
    </>
  );
}
