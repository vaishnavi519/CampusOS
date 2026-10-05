import { apiRequest } from './api.js';

export async function listClubs() {
  const data = await apiRequest('/clubs');
  return data.clubs ?? [];
}

export async function getClub(id) {
  const data = await apiRequest(`/clubs/${id}`);
  return data.club;
}

export async function joinClub(id) {
  return apiRequest(`/clubs/${id}/join`, {
    method: 'POST',
  });
}

export async function listMyMemberships() {
  const data = await apiRequest('/clubs/my-clubs');
  return data.clubs ?? [];
}

export async function listClubMembers(id) {
  const data = await apiRequest(`/clubs/${id}/members`);
  return {
    club: data.club,
    members: data.members ?? [],
  };
}

export async function createClub(payload) {
  const data = await apiRequest('/clubs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.club;
}

export async function listAdminClubs() {
  const data = await apiRequest('/clubs/administered');

  return (data.clubs ?? []).map((club) => ({
    ...club,
    member_count: Number(club.member_count ?? 0),
    pending_count: Number(club.pending_count ?? 0),
  }));
}

export async function listCoordinators() {
  return [];
}

export async function reviewMembership(membershipId, decision) {
  const status = decision === 'approve' ? 'APPROVED' : 'REJECTED';

  return apiRequest(`/clubs/memberships/${membershipId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
