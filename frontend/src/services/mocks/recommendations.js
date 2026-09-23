import {
  EVENT_STATUS,
  MEMBERSHIP_STATUS,
  REGISTRATION_STATUS,
  ROLES,
} from '../../utils/constants.js';
import { requireRole } from './session.js';
import { clone, latency, snapshot } from './store.js';
import { isPastDate } from '../../utils/format.js';

/**
 * Demo counterpart of GET /api/recommendations.
 *
 * The real ranking lives in the backend. This stands in with a rule the demo
 * can explain out loud: upcoming published events the student has not already
 * registered for, clubs they belong to first.
 */
export async function listRecommendations() {
  await latency(260);
  const student = requireRole(ROLES.STUDENT);
  const { events, clubs, memberships, registrations } = snapshot();

  const myClubIds = new Set(
    memberships
      .filter(
        (row) =>
          row.student_id === student.id &&
          row.status === MEMBERSHIP_STATUS.APPROVED,
      )
      .map((row) => row.club_id),
  );

  const registeredEventIds = new Set(
    registrations
      .filter(
        (row) =>
          row.student_id === student.id &&
          row.status !== REGISTRATION_STATUS.CANCELLED,
      )
      .map((row) => row.event_id),
  );

  const rows = events
    .filter(
      (event) =>
        event.status === EVENT_STATUS.PUBLISHED &&
        !isPastDate(event.event_date) &&
        !registeredEventIds.has(event.id),
    )
    .map((event) => {
      const club = clubs.find((row) => row.id === event.club_id);
      const fromMyClub = myClubIds.has(event.club_id);
      return {
        id: event.id,
        event_id: event.id,
        title: event.title,
        club_id: event.club_id,
        club_name: club?.name ?? null,
        event_date: event.event_date,
        event_time: event.event_time,
        venue: event.venue,
        reason: fromMyClub
          ? `From ${club?.name ?? 'a club'}, which you are a member of`
          : `Open to all students · ${club?.category ?? 'Campus'}`,
        _rank: fromMyClub ? 0 : 1,
      };
    })
    .sort(
      (a, b) =>
        a._rank - b._rank ||
        String(a.event_date).localeCompare(String(b.event_date)),
    )
    .slice(0, 6)
    .map(({ _rank, ...row }) => row);

  return clone(rows);
}
