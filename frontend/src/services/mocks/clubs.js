import api from '../api.js';
import { ApiError } from '../errors.js';

function handleError(error) {
  if (error instanceof ApiError) throw error;

  const status = error.response?.status;
  const data = error.response?.data;

  const message =
    data?.message ||
    data?.detail ||
    'Unable to complete the club request. Please try again.';

  throw new ApiError(message, { status: status || 500 });
}

async function request(callback) {
  try {
    const response = await callback();
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// Get clubs
export async function listClubs() {
  return request(() => api.get('/clubs'));
}

// Get one club
export async function getClub(id) {
  return request(() => api.get(`/clubs/${id}`));
}

// Apply for club membership
export async function joinClub(id) {
  return request(() => api.post(`/clubs/${id}/apply`));
}

// Get memberships of logged-in student
export async function listMyMemberships() {
  const memberships = await request(() => api.get('/memberships/my'));
  const clubs = await request(() => api.get('/clubs'));

  return memberships.map((membership) => {
    const club = clubs.find(
      (item) => Number(item.id) === Number(membership.club_id),
    );

    return {
      membership_id: membership.id,
      club_id: membership.club_id,
      name: club?.name ?? 'Unknown club',
      description: club?.description ?? null,
      category: club?.category ?? null,
      logo_url: null,
      website: null,
      status: membership.status,
      applied_at: membership.applied_at,
      reviewed_at: membership.reviewed_at,
    };
  });
}

// Get membership applications for a club
export async function listClubMembers(id) {
  const [club, memberships] = await Promise.all([
    request(() => api.get(`/clubs/${id}`)),
    request(() => api.get(`/clubs/${id}/memberships`)),
  ]);

  return {
    club: {
      id: club.id,
      name: club.name,
    },
    members: memberships.map((membership) => ({
      membership_id: membership.id,
      student_id: membership.student_id,
      student_name: 'Student',
      student_email: '',
      status: membership.status,
      applied_at: membership.applied_at,
      reviewed_at: membership.reviewed_at,
    })),
  };
}

// Create a club
export async function createClub(payload) {
  const data = await request(() =>
    api.post('/clubs/create', {
      name: payload.name,
      description: payload.description || '',
      category: payload.category,
      faculty_coordinator_id: Number(payload.faculty_coordinator_id),
    }),
  );

  return data.club;
}

// Approve or reject a membership request
export async function reviewMembership(membershipId, decision) {
  const status = decision.toUpperCase() === 'APPROVE'
    ? 'APPROVED'
    : 'REJECTED';

  const data = await request(() =>
    api.patch(`/memberships/${membershipId}/review`, { status }),
  );

  return data.membership;
}

// Get clubs managed by the logged-in club administrator
export async function listAdminClubs() {
  const clubs = await listClubs();

  return Promise.all(
    clubs.map(async (club) => {
      const memberships = await request(() =>
        api.get(`/clubs/${club.id}/memberships`),
      );

      return {
        ...club,
        member_count: memberships.filter(
          (item) => item.status === 'APPROVED',
        ).length,
        pending_count: memberships.filter(
          (item) => item.status === 'PENDING',
        ).length,
      };
    }),
  );
}

// This endpoint must be added to Django before coordinators can be loaded.
export async function listCoordinators() {
  throw new ApiError(
    'Faculty coordinator listing is not yet available in the Django backend.',
    { status: 501 },
  );
}