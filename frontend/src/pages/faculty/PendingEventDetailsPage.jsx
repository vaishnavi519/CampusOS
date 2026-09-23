import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Textarea } from '../../components/ui/Field.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import {
  DetailList,
  Panel,
  PanelBody,
  PanelHeader,
} from '../../components/ui/Panel.jsx';
import { AsyncSection, ListSkeleton } from '../../components/ui/States.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { eventService } from '../../services/index.js';
import {
  formatDateLong,
  formatTime,
  orPlaceholder,
} from '../../utils/format.js';

/**
 * One pending proposal, with the approve and reject decisions.
 *
 * There is no GET /api/events/:id, so the event is selected from the pending
 * queue rather than fetched on its own — the same approach the published event
 * screen takes. Replace this the moment a single-event endpoint exists.
 */
export function PendingEventDetailsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(null);
  const [working, setWorking] = useState(false);

  const pending = useAsync(() => eventService.listPendingEvents(), []);

  const event = (pending.data ?? []).find(
    (row) => String(row.id) === String(eventId),
  );

  const approve = async () => {
    setWorking(true);
    try {
      await eventService.approveEvent(event.id);
      toast.success(
        `${event.title} was approved and is now waiting to be published.`,
      );
      navigate('/faculty/pending');
    } catch (error) {
      toast.error(error.message);
      setWorking(false);
    }
  };

  /** The contract requires rejection_reason, so it is enforced before sending. */
  const reject = async () => {
    if (!reason.trim()) {
      setReasonError('Tell the club why this event is being returned.');
      return;
    }

    setWorking(true);
    try {
      await eventService.rejectEvent(event.id, reason.trim());
      toast.info(`${event.title} was returned to the club with your reason.`);
      navigate('/faculty/pending');
    } catch (error) {
      toast.error(error.message);
      setWorking(false);
    }
  };

  if (pending.loading || pending.error || !event) {
    return (
      <>
        <PageHeader
          title={pending.loading ? 'Loading event' : 'Event'}
          parent={{ label: 'Pending events', to: '/faculty/pending' }}
        />
        <Panel>
          <AsyncSection
            loading={pending.loading}
            error={pending.error}
            onRetry={pending.refetch}
            skeleton={<ListSkeleton rows={3} />}
            isEmpty={!event}
            empty={
              <div className="state">
                <p className="state__title">
                  This event is no longer in the approval queue
                </p>
                <p className="state__desc">
                  It may have already been approved or returned by another
                  coordinator.
                </p>
                <div className="state__actions">
                  <Button to="/faculty/pending">Back to the queue</Button>
                </div>
              </div>
            }
          />
        </Panel>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={event.title}
        parent={{ label: 'Pending events', to: '/faculty/pending' }}
        actions={
          <div className="row-wrap">
            <Button
              variant="primary"
              icon="check"
              onClick={() => setConfirmApprove(true)}
            >
              Approve
            </Button>
            <Button variant="danger" icon="x" onClick={() => setRejecting(true)}>
              Reject
            </Button>
          </div>
        }
      >
        <div className="row-wrap" style={{ marginTop: 8 }}>
          <StatusBadge kind="event" status={event.status} />
        </div>
      </PageHeader>

      <div className="dash-grid">
        <div className="stack">
          <Panel>
            <PanelHeader title="Proposal" />
            <PanelBody>
              <DetailList
                items={[
                  { term: 'Club', value: orPlaceholder(event.club_name) },
                  { term: 'Date', value: formatDateLong(event.event_date) },
                  { term: 'Time', value: formatTime(event.event_time) },
                  { term: 'Venue', value: orPlaceholder(event.venue) },
                  {
                    term: 'Capacity',
                    value:
                      typeof event.capacity === 'number'
                        ? `${event.capacity} seats`
                        : orPlaceholder(event.capacity),
                  },
                  {
                    term: 'Eligibility',
                    value: orPlaceholder(event.eligibility),
                  },
                ]}
              />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Description" />
            <PanelBody>
              <p style={{ fontSize: 'var(--fs-14)', maxWidth: '72ch' }}>
                {event.description ||
                  'The organising club did not add a description for this event.'}
              </p>
            </PanelBody>
          </Panel>
        </div>

        <Panel>
          <PanelHeader title="Your decision" />
          <PanelBody className="stack">
            <p className="text-secondary" style={{ fontSize: 'var(--fs-14)' }}>
              Approving sends this event to the system administrator for
              publication. Rejecting returns it to the club with your reason, so
              they can revise and resubmit it.
            </p>
            <Button variant="primary" block onClick={() => setConfirmApprove(true)}>
              Approve event
            </Button>
            <Button variant="danger" block onClick={() => setRejecting(true)}>
              Reject event
            </Button>
          </PanelBody>
        </Panel>
      </div>

      <ConfirmDialog
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={approve}
        loading={working}
        title="Approve this event?"
        description={`${event.title} will move to the system administrator to be published to the campus calendar.`}
        confirmLabel="Approve"
        cancelLabel="Not yet"
      />

      <Modal
        open={rejecting}
        onClose={working ? () => {} : () => setRejecting(false)}
        title="Reject this event"
        description={`${event.title} will be returned to ${event.club_name ?? 'the organising club'}.`}
        footer={
          <>
            <Button onClick={() => setRejecting(false)} disabled={working}>
              Cancel
            </Button>
            <Button variant="danger" loading={working} onClick={reject}>
              Reject event
            </Button>
          </>
        }
      >
        <Field
          label="Reason for rejection"
          required
          error={reasonError}
          hint="The club sees this message, so be specific about what needs to change."
        >
          {(a11y) => (
            <Textarea
              {...a11y}
              data-autofocus
              rows={4}
              value={reason}
              onChange={(changeEvent) => {
                setReason(changeEvent.target.value);
                if (reasonError) setReasonError(null);
              }}
              placeholder="e.g. The venue clashes with the departmental practical exam that evening."
            />
          )}
        </Field>
      </Modal>
    </>
  );
}
