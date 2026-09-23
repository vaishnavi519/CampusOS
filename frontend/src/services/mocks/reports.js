import { REGISTRATION_STATUS, ROLES } from '../../utils/constants.js';
import { requireRole } from './session.js';
import { clone, latency, snapshot } from './store.js';

/**
 * Demo counterpart of GET /api/reports/my-participation.
 * Aggregated from the same registration and attendance rows the rest of demo
 * mode uses, so the numbers agree with every other screen.
 */
export async function getMyParticipation() {
  await latency(240);
  const student = requireRole(ROLES.STUDENT);
  const { registrations, attendance, events, clubs } = snapshot();

  const mine = registrations.filter(
    (row) =>
      row.student_id === student.id &&
      row.status !== REGISTRATION_STATUS.CANCELLED,
  );

  const report = mine
    .map((row) => {
      const event = events.find((item) => item.id === row.event_id);
      const club = clubs.find((item) => item.id === event?.club_id);
      const marked = attendance.find(
        (item) => item.event_id === row.event_id && item.student_id === student.id,
      );

      return {
        event_id: row.event_id,
        attendance_status: marked?.status ?? null,
        registration_status: row.status,
        title: event?.title ?? null,
        event_date: event?.event_date ?? null,
        event_time: event?.event_time ?? null,
        venue: event?.venue ?? null,
        club_name: club?.name ?? null,
      };
    })
    .sort((a, b) => String(b.event_date).localeCompare(String(a.event_date)));

  return clone({
    summary: {
      total_registered: report.length,
      total_attended: report.filter((row) => row.attendance_status === 'PRESENT')
        .length,
    },
    report,
  });
}
