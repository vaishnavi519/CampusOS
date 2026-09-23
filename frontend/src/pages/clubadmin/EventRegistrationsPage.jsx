import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Metric } from '../../components/dashboard/Metric.jsx';
import { Panel, PanelHeader } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { attendanceService, registrationService } from '../../services/index.js';
import {
  ATTENDANCE_STATUS,
  REGISTRATION_STATUS,
} from '../../utils/constants.js';
import { formatDate, initials } from '../../utils/format.js';

/**
 * GET /api/events/:id/registrations plus the attendance endpoints.
 *
 * Attendance is written through POST /api/events/:id/attendance and read back
 * from GET /api/events/:id/attendance — the backend stays the single source of
 * truth, so the list is refetched after every mark rather than patched locally.
 */
export function EventRegistrationsPage() {
  const { eventId } = useParams();
  const toast = useToast();
  const [working, setWorking] = useState(null);

  const data = useAsync(
    () => registrationService.listEventRegistrations(eventId),
    [eventId],
  );
  const attendance = useAsync(
    () => attendanceService.listAttendance(eventId),
    [eventId],
  );

  const event = data.data?.event;
  const registrations = useMemo(
    () => data.data?.registrations ?? [],
    [data.data],
  );

  const attendanceByStudent = useMemo(
    () =>
      new Map(
        (attendance.data ?? []).map((row) => [String(row.student_id), row.status]),
      ),
    [attendance.data],
  );

  const active = registrations.filter(
    (row) => row.status !== REGISTRATION_STATUS.CANCELLED,
  );
  const present = (attendance.data ?? []).filter(
    (row) => row.status === ATTENDANCE_STATUS.PRESENT,
  ).length;

  const mark = async (registration, status) => {
    setWorking(`${registration.student_id}-${status}`);
    try {
      await attendanceService.markAttendance(eventId, {
        student_id: registration.student_id,
        status,
      });
      toast.success(
        `${registration.student_name} marked ${status === ATTENDANCE_STATUS.PRESENT ? 'present' : 'absent'}.`,
      );
      await attendance.refetch();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setWorking(null);
    }
  };

  return (
    <>
      <PageHeader
        title={event?.title ? `${event.title} — registrations` : 'Registrations'}
        description="Who has signed up, and who turned up on the day."
        parent={{ label: 'My events', to: '/club-admin/events' }}
      />

      <div className="metric-row">
        <Metric
          value={active.length}
          label="Registered"
          loading={data.loading}
          unavailable={Boolean(data.error)}
        />
        <Metric
          value={event?.capacity ?? null}
          label="Capacity"
          loading={data.loading}
          unavailable={Boolean(data.error)}
        />
        <Metric
          value={present}
          label="Marked present"
          loading={attendance.loading}
          unavailable={Boolean(attendance.error)}
        />
        <Metric
          value={Math.max(0, active.length - (attendance.data?.length ?? 0))}
          label="Not yet marked"
          loading={attendance.loading}
          unavailable={Boolean(attendance.error)}
        />
      </div>

      <Panel flush>
        <PanelHeader title="Attendee list" />
        <AsyncSection
          loading={data.loading}
          error={data.error}
          onRetry={data.refetch}
          skeleton={<ListSkeleton rows={4} />}
          isEmpty={registrations.length === 0}
          empty={
            <EmptyState
              icon="ticket"
              title="No registrations yet"
              description="Students who register for this event will appear here, ready for attendance."
            />
          }
        >
          <div className="record-list">
            {registrations.map((registration) => {
              const marked = attendanceByStudent.get(
                String(registration.student_id),
              );
              const cancelled =
                registration.status === REGISTRATION_STATUS.CANCELLED;

              return (
                <div className="record" key={registration.registration_id}>
                  <span className="club-monogram" aria-hidden="true">
                    {initials(registration.student_name)}
                  </span>

                  <div className="record__body">
                    <p className="record__title">
                      {registration.student_name ?? 'Unknown student'}
                    </p>
                    <p className="record__meta">
                      <span>{registration.student_email}</span>
                      {registration.registered_at ? (
                        <span className="record__meta-sep">
                          Registered {formatDate(registration.registered_at)}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="record__aside row-wrap">
                    <StatusBadge
                      kind="registration"
                      status={registration.status}
                    />
                    {cancelled ? null : (
                      <>
                        <StatusBadge kind="attendance" status={marked} />
                        <Button
                          size="sm"
                          variant={
                            marked === ATTENDANCE_STATUS.PRESENT
                              ? 'primary'
                              : 'secondary'
                          }
                          loading={
                            working ===
                            `${registration.student_id}-${ATTENDANCE_STATUS.PRESENT}`
                          }
                          disabled={Boolean(working)}
                          onClick={() =>
                            mark(registration, ATTENDANCE_STATUS.PRESENT)
                          }
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={
                            working ===
                            `${registration.student_id}-${ATTENDANCE_STATUS.ABSENT}`
                          }
                          disabled={Boolean(working)}
                          onClick={() =>
                            mark(registration, ATTENDANCE_STATUS.ABSENT)
                          }
                        >
                          Absent
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}
