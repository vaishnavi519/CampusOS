import { REGISTRATION_STATUS, ROLES } from '../../utils/constants.js';
import { requireRole } from './session.js';
import { latency, snapshot } from './store.js';

/** Demo counterpart of GET /api/stats/platform. */
export async function getPlatformStats() {
  await latency(240);
  requireRole(ROLES.SYSTEM_ADMIN);

  const { users, clubs, events, registrations, attendance } = snapshot();

  return {
    total_users: users.length,
    total_clubs: clubs.length,
    total_events: events.length,
    total_registrations: registrations.filter(
      (row) => row.status !== REGISTRATION_STATUS.CANCELLED,
    ).length,
    total_attendance: attendance.length,
  };
}
