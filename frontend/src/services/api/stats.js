import { get } from './client.js';

/**
 * Live implementation of GET /api/stats/platform. Role: SYSTEM_ADMIN.
 *
 * This is the current endpoint. The older /admin/statistics is not used.
 */
export async function getPlatformStats(options) {
  const data = await get('/stats/platform', options);
  const statistics = data.statistics ?? {};

  return {
    total_users: statistics.total_users ?? 0,
    total_clubs: statistics.total_clubs ?? 0,
    total_events: statistics.total_events ?? 0,
    total_registrations: statistics.total_registrations ?? 0,
    total_attendance: statistics.total_attendance ?? 0,
  };
}
