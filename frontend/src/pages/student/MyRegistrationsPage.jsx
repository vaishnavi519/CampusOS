import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
import { Tabs } from '../../components/ui/Toolbar.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { registrationService } from '../../services/index.js';
import { isDemoMode } from '../../services/dataSource.js';
import { REGISTRATION_STATUS } from '../../utils/constants.js';
import {
  formatDate,
  formatTime,
  isPastDate,
  orPlaceholder,
} from '../../utils/format.js';

const TABS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function MyRegistrationsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('upcoming');
  const [pendingCancel, setPendingCancel] = useState(null);
  const [working, setWorking] = useState(false);

  const registrations = useAsync(
    () => registrationService.listMyRegistrations(),
    [],
  );

  const rows = useMemo(() => registrations.data ?? [], [registrations.data]);

  const grouped = useMemo(() => {
    const upcoming = [];
    const past = [];
    const cancelled = [];

    for (const row of rows) {
      if (row.status === REGISTRATION_STATUS.CANCELLED) cancelled.push(row);
      else if (isPastDate(row.event_date)) past.push(row);
      else upcoming.push(row);
    }
    return { upcoming, past, cancelled };
  }, [rows]);

  const visible = grouped[tab] ?? [];

  /**
   * Cancelling is demo-only until the backend exposes an endpoint for it, so
   * the action is hidden rather than shown and then failing.
   */
  const canCancel = isDemoMode();

  const handleCancel = async () => {
    setWorking(true);
    try {
      await registrationService.cancelRegistration(
        pendingCancel.registration_id,
      );
      toast.info(`Registration for ${pendingCancel.title} cancelled.`);
      setPendingCancel(null);
      await registrations.refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <>
      <PageHeader
        title="My registrations"
        description="Events you have signed up for, newest date first."
        actions={
          <Button to="/app/events" icon="calendar">
            Browse events
          </Button>
        }
      />

      {rows.length > 0 ? (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Tabs
            label="Filter registrations"
            value={tab}
            onChange={setTab}
            items={TABS.map((item) => ({
              ...item,
              count: grouped[item.value].length,
            }))}
          />
        </div>
      ) : null}

      <Panel flush>
        <AsyncSection
          loading={registrations.loading}
          error={registrations.error}
          onRetry={registrations.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={visible.length === 0}
          empty={
            rows.length === 0 ? (
              <EmptyState
                icon="ticket"
                title="No registrations yet"
                description="When you register for a published event it will appear here with its date and venue."
                action={
                  <Button variant="primary" to="/app/events">
                    Browse events
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon="filter"
                title={`Nothing ${tab}`}
                description="Choose a different tab to see your other registrations."
              />
            )
          }
        >
          <div className="record-list">
            {visible.map((row) => (
              <div className="record" key={row.registration_id}>
                <DateChip date={row.event_date} />

                <div className="record__body">
                  <p className="record__title">
                    <Link to={`/app/events/${row.event_id}`}>{row.title}</Link>
                  </p>
                  <p className="record__meta">
                    <span className="row" style={{ gap: 5 }}>
                      <Icon name="clock" size={13} />
                      {formatTime(row.event_time)}
                    </span>
                    <span className="record__meta-sep row" style={{ gap: 5 }}>
                      <Icon name="pin" size={13} />
                      {orPlaceholder(row.venue)}
                    </span>
                    {row.club_name ? (
                      <span className="record__meta-sep">{row.club_name}</span>
                    ) : null}
                  </p>
                  <p className="record__meta">
                    <span>
                      {row.status === REGISTRATION_STATUS.CANCELLED
                        ? `Cancelled ${formatDate(row.cancelled_at)}`
                        : `Registered ${formatDate(row.registered_at)}`}
                    </span>
                  </p>
                </div>

                <div className="record__aside">
                  <StatusBadge kind="registration" status={row.status} />
                  {canCancel &&
                  row.status !== REGISTRATION_STATUS.CANCELLED &&
                  !isPastDate(row.event_date) ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPendingCancel(row)}
                    >
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingCancel)}
        onClose={() => setPendingCancel(null)}
        onConfirm={handleCancel}
        loading={working}
        tone="danger"
        title="Cancel this registration?"
        description={
          pendingCancel
            ? `Your seat for ${pendingCancel.title} will be released.`
            : ''
        }
        confirmLabel="Cancel registration"
        cancelLabel="Keep my seat"
      />
    </>
  );
}
