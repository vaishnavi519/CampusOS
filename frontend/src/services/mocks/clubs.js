
import api from '../api.js';
import { ApiError } from '../errors.js';

function handleError(error) {
  if (error instanceof ApiError) {
    throw error;
  }

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

export async function listClubs() {
  return request(() => api.get('/clubs'));
}

export async function getClub(id) {
  return request(() => api.get(`/clubs/${id}`));
}

export async function joinClub(id) {
  const data = await request(() => api.post(`/clubs/${id}/apply`));
  return data.membership;
}

export async function listMyMemberships() {
  const memberships = await request(() => api.get('/memberships/my'));
  const clubs = await listClubs();

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

export async function listClubMembers(id) {
  const [club, memberships] = await Promise.all([
    getClub(id),
    request(() => api.get(`/clubs/${id}/memberships`)),
  ]);

  return {
    club: {
      id: club.id,
      name: club.name,
    },
    members: memberships.map((membership) => ({
      membership_id: membership.membership_id ?? membership.id,
      student_id: membership.student_id,
      student_name: membership.student_name || 'Unknown student',
      student_email: membership.student_email || '',
      status: membership.status,
      applied_at: membership.applied_at,
      reviewed_at: membership.reviewed_at,
    })),
  };
}

export async function createClub(payload) {
  if (!payload.faculty_coordinator_id) {
    throw new ApiError('Please select a faculty coordinator.', {
      status: 400,
    });
  }

  const data = await request(() =>
    api.post('/clubs/create', {
      name: payload.name,
      description: payload.description || '',
      category: payload.category,
      faculty_coordinator_id: Number(
        payload.faculty_coordinator_id,
      ),
    }),
  );

  return data.club;
}

export async function reviewMembership(membershipId, decision) {
  const normalizedDecision = decision.toUpperCase();

  const status =
    normalizedDecision === 'APPROVE' ||
    normalizedDecision === 'APPROVED'
      ? 'APPROVED'
      : normalizedDecision === 'REJECT' ||
          normalizedDecision === 'REJECTED'
        ? 'REJECTED'
        : null;

  if (!status) {
    throw new ApiError('Invalid membership review decision.', {
      status: 400,
    });
  }

  const data = await request(() =>
    api.patch(`/memberships/${membershipId}/review`, { status }),
  );

  return data.membership;
}

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

export async function listCoordinators() {
  return request(() => api.get('/clubs/coordinators'));
}

export async function reviewClub(clubId, decision) {
  const normalizedDecision = decision.toUpperCase();

  if (!['APPROVED', 'REJECTED'].includes(normalizedDecision)) {
    throw new ApiError('Invalid club approval decision.', {
      status: 400,
    });
  }

  return request(() =>
    api.patch(`/clubs/${clubId}/approval`, {
      status: normalizedDecision,
    }),
  );
}
