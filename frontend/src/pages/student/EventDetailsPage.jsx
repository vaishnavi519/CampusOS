import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import {
  DetailList,
  Panel,
  PanelBody,
  PanelHeader,
} from '../../components/ui/Panel.jsx';
import {
  Alert,
  AsyncSection,
  ListSkeleton,
  PendingBackendNotice,
} from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { eventService, registrationService } from '../../services/index.js';
import { NotImplementedError } from '../../services/errors.js';
import { REGISTRATION_STATUS, ROLES } from '../../utils/constants.js';
import {
  formatDateLong,
  formatTime,
  isPastDate,
  orPlaceholder,
} from '../../utils/format.js';
import { registrationStatus as describeRegistration } from '../../utils/status.js';

export function EventDetailsPage() {
  const { eventId } = useParams();
  const { role } = useAuth();
  const toast = useToast();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [working, setWorking] = useState(false);

  const event = useAsync(
    () => eventService.getPublishedEvent(eventId),
    [eventId],
  );

  const isStudent = role === ROLES.STUDENT;

  const registration = useAsync(
    () => registrationService.getRegistrationForEvent(eventId),
    [eventId],
    { enabled: isStudent },
  );

  const capacity = useAsync(
    () => registrationService.getEventCapacity(eventId),
    [eventId],
    { enabled: isStudent },
  );

  if (event.loading || event.error) {
    return (
      <>
        <PageHeader
          title={event.loading ? 'Loading event' : 'Event'}
          parent={{ label: 'Browse events', to: '/app/events' }}
        />
        <Panel>
          <AsyncSection
            loading={event.loading}
            error={event.error}
            onRetry={event.refetch}
            skeleton={<ListSkeleton rows={3} />}
          />
        </Panel>
      </>
    );
  }

  const record = event.data;
  const past = isPastDate(record.event_date);
  const active =
    registration.data &&
    registration.data.status !== REGISTRATION_STATUS.CANCELLED;

  const seatsLeft =
    capacity.data && typeof capacity.data.taken === 'number'
      ? Math.max(0, capacity.data.capacity - capacity.data.taken)
      : null;

  const refreshRegistration = async () => {
    await Promise.all([registration.refetch(), capacity.refetch()]);
  };

  const handleRegister = async () => {
    setWorking(true);
    try {
      const result = await registrationService.registerForEvent(record.id);
      toast.success(
        result.status === REGISTRATION_STATUS.WAITLISTED
          ? 'All seats are taken — you have been added to the waitlist.'
          : `You are registered for ${record.title}.`,
      );
      await refreshRegistration();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  const handleCancel = async () => {
    setWorking(true);
    try {
      await registrationService.cancelRegistration(
        registration.data.id ?? registration.data.registration_id,
      );
      toast.info('Your registration has been cancelled.');
      setConfirmCancel(false);
      await refreshRegistration();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <PageHeader
        title={record.title}
        parent={{ label: 'Browse events', to: '/app/events' }}
      >
        <div className="row-wrap" style={{ marginTop: 8 }}>
          <StatusBadge kind="event" status={record.status} />
          {past ? (
            <span className="text-muted" style={{ fontSize: 'var(--fs-13)' }}>
              This event has already taken place.
            </span>
          ) : null}
        </div>
      </PageHeader>

      <div className="dash-grid">
        <div className="stack">
          <Panel>
            <PanelHeader title="Event details" />
            <PanelBody className="stack">
              <DetailList
                items={[
                  { term: 'Date', value: formatDateLong(record.event_date) },
                  { term: 'Time', value: formatTime(record.event_time) },
                  { term: 'Venue', value: orPlaceholder(record.venue) },
                  {
                    term: 'Organised by',
                    value: record.club_id ? (
                      <Link
                        to={`/app/clubs/${record.club_id}`}
                        className="btn btn--link"
                      >
                        {orPlaceholder(record.club_name)}
                      </Link>
                    ) : (
                      orPlaceholder(record.club_name)
                    ),
                  },
                  {
                    term: 'Capacity',
                    value:
                      typeof record.capacity === 'number'
                        ? `${record.capacity} seats`
                        : orPlaceholder(record.capacity),
                  },
                  {
                    term: 'Eligibility',
                    value: orPlaceholder(record.eligibility),
                  },
                ]}
              />
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="About this event" />
            <PanelBody>
              <p style={{ fontSize: 'var(--fs-14)', maxWidth: '72ch' }}>
                {record.description ??
                  'The organising club has not added a description for this event.'}
              </p>
            </PanelBody>
          </Panel>
        </div>

        {isStudent ? (
          <Panel>
            <PanelHeader title="Registration" />
            <PanelBody className="stack">
              {registration.error instanceof NotImplementedError ? (
                <PendingBackendNotice
                  error={registration.error}
                  className="state--compact"
                />
              ) : registration.loading ? (
                <p className="text-muted" style={{ fontSize: 'var(--fs-14)' }}>
                  Checking your registration…
                </p>
              ) : (
                <>
                  {active ? (
                    <Alert
                      tone={
                        registration.data.status ===
                        REGISTRATION_STATUS.WAITLISTED
                          ? 'warning'
                          : 'success'
                      }
                      title={describeRegistration(registration.data.status).label}
                    >
                      {describeRegistration(registration.data.status).hint}
                    </Alert>
                  ) : null}

                  {seatsLeft !== null ? (
                    <p
                      className="text-secondary"
                      style={{ fontSize: 'var(--fs-14)' }}
                    >
                      <strong className="num">{seatsLeft}</strong> of{' '}
                      <span className="num">{capacity.data.capacity}</span> seats
                      remaining.
                    </p>
                  ) : null}

                  {past ? (
                    <p className="text-muted" style={{ fontSize: 'var(--fs-14)' }}>
                      Registration closed when the event took place.
                    </p>
                  ) : active ? (
                    <Button
                      variant="danger"
                      block
                      onClick={() => setConfirmCancel(true)}
                    >
                      Cancel registration
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      block
                      loading={working}
                      onClick={handleRegister}
                    >
                      {seatsLeft === 0 ? 'Join the waitlist' : 'Register'}
                    </Button>
                  )}
                </>
              )}
            </PanelBody>
          </Panel>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        loading={working}
        tone="danger"
        title="Cancel this registration?"
        description={`Your seat for ${record.title} will be released and may be taken by someone else.`}
        confirmLabel="Cancel registration"
        cancelLabel="Keep my seat"
      />
    </>
  );
}
