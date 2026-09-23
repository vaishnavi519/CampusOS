import { get } from './client.js';

/**
 * Live implementation of GET /api/recommendations. Role: STUDENT.
 *
 * A recommendation identifies an event by `event_id` rather than `id`, so the
 * id is surfaced under both names — the event card links by `id`.
 */
export async function listRecommendations(options) {
  const data = await get('/recommendations', options);

  return (data.recommendations ?? []).map((row) => ({
    id: row.event_id ?? row.id,
    event_id: row.event_id ?? row.id,
    title: row.title ?? null,
    club_id: row.club_id ?? null,
    club_name: row.club_name ?? null,
    event_date: row.event_date ?? null,
    event_time: row.event_time ?? null,
    venue: row.venue ?? null,
    reason: row.reason ?? null,
  }));
}
