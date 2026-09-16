import { get, post } from './client.js';

/**
 * Live implementations of backend/routes/clubRoutes.js.
 *
 * Functions deliberately absent because the backend has no such route yet:
 *   reviewMembership  (approve / reject a join request)
 *   listAdminClubs    (clubs owned by the signed-in club admin)
 *   listCoordinators  (faculty coordinators to attach to a new club)
 * They resolve to NotImplementedError in live mode — see services/dataSource.js.
 */

/** GET /api/clubs -> Club[] (public) */
export async function listClubs(options) {
  const data = await get('/clubs', { ...options, auth: false });
  return data.clubs ?? [];
}

/** GET /api/clubs/:id -> Club (public, includes admin_id + status) */
export async function getClub(id, options) {
  const data = await get(`/clubs/${id}`, { ...options, auth: false });
  return data.club;
}

/** POST /api/clubs/:id/join -> { message }. Role: STUDENT. 409 if already applied. */
export async function joinClub(id) {
  return post(`/clubs/${id}/join`);
}

/** GET /api/clubs/my-clubs -> Membership[]. Role: STUDENT. */
export async function listMyMemberships(options) {
  const data = await get('/clubs/my-clubs', options);
  return data.clubs ?? [];
}

/** GET /api/clubs/:id/members -> { club, members }. Role: CLUB_ADMIN, own club only. */
export async function listClubMembers(id, options) {
  const data = await get(`/clubs/${id}/members`, options);
  return { club: data.club, members: data.members ?? [] };
}

/** POST /api/clubs -> Club. Role: CLUB_ADMIN. faculty_coordinator_id is required. */
export async function createClub(payload) {
  const data = await post('/clubs', payload);
  return data.club;
}
