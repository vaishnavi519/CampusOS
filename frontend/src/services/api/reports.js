import { get } from './client.js';

/**
 * Live implementation of GET /api/reports/my-participation. Role: STUDENT.
 *
 * Returns { summary, report }. The summary is echoed straight through; report
 * rows are given the display fields the screen needs when the API supplies
 * them, and null when it does not.
 */
export async function getMyParticipation(options) {
  const data = await get('/reports/my-participation', options);

  return {
    summary: {
      total_registered: data.summary?.total_registered ?? 0,
      total_attended: data.summary?.total_attended ?? 0,
    },
    report: (data.report ?? []).map((row) => ({
      event_id: row.event_id,
      attendance_status: row.attendance_status ?? null,
      registration_status: row.registration_status ?? row.status ?? null,
      title: row.title ?? null,
      event_date: row.event_date ?? null,
      event_time: row.event_time ?? null,
      venue: row.venue ?? null,
      club_name: row.club_name ?? null,
    })),
  };
}
