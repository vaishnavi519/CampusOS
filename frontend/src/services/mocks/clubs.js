import { MEMBERSHIP_STATUS, ROLES } from '../../utils/constants.js';
import { ApiError } from '../errors.js';
import { pushNotification } from './notifications.js';
import { requireRole } from './session.js';
import { clone, commit, latency, nextId, snapshot } from './store.js';

/** Demo implementations of the club endpoints, plus the ones still to be built. */

const publicFields = ({
  id,
  name,
  description,
  category,
  logo_url,
  website,
  created_at,
}) => ({
  id,
  name,
  description,
  category,
  logo_url,
  website,
  created_at,
});

export async function listClubs() {
  await latency();
  return clone(snapshot().clubs.map(publicFields));
}

export async function getClub(id) {
  await latency();
  const club = snapshot().clubs.find((row) => String(row.id) === String(id));
  if (!club) throw new ApiError('Club not found.', { status: 404 });
  return clone(club);
}

export async function joinClub(id) {
  await latency();
  const student = requireRole(ROLES.STUDENT);

  const club = snapshot().clubs.find((row) => String(row.id) === String(id));
  if (!club) throw new ApiError('Club not found.', { status: 404 });

  const existing = snapshot().memberships.find(
    (row) => String(row.club_id) === String(id) && row.student_id === student.id,
  );
  if (existing) {
    throw new ApiError('You have already joined this club.', { status: 409 });
  }

  return commit((state) => {
    state.memberships.push({
      id: nextId('memberships'),
      club_id: Number(id),
      student_id: student.id,
      status: MEMBERSHIP_STATUS.PENDING,
      applied_at: new Date().toISOString(),
      reviewed_at: null,
    });

    pushNotification(state, {
      user_id: student.id,
      type: 'MEMBERSHIP_SUBMITTED',
      title: `Membership request sent to ${club.name}`,
      body: 'Your request is waiting for the club administrator to review it.',
      link: `/app/clubs/${club.id}`,
    });

    pushNotification(state, {
      user_id: club.admin_id,
      type: 'MEMBERSHIP_REQUEST',
      title: `${student.name} asked to join ${club.name}`,
      body: 'A membership request is waiting for review.',
      link: `/club-admin/clubs/${club.id}/members`,
    });

    return { message: 'Successfully joined the club' };
  });
}

export async function listMyMemberships() {
  await latency();
  const student = requireRole(ROLES.STUDENT);
  const { memberships, clubs } = snapshot();

  const rows = memberships
    .filter((row) => row.student_id === student.id)
    .map((row) => {
      const club = clubs.find((item) => item.id === row.club_id);
      return {
        membership_id: row.id,
        club_id: row.club_id,
        name: club?.name ?? 'Unknown club',
        description: club?.description ?? null,
        category: club?.category ?? null,
        logo_url: club?.logo_url ?? null,
        website: club?.website ?? null,
        status: row.status,
        applied_at: row.applied_at,
        reviewed_at: row.reviewed_at,
      };
    })
    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));

  return clone(rows);
}

export async function listClubMembers(id) {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);
  const { clubs, memberships, users } = snapshot();

  const club = clubs.find(
    (row) => String(row.id) === String(id) && row.admin_id === admin.id,
  );
  if (!club) {
    throw new ApiError('Club not found or you are not the club admin.', {
      status: 404,
    });
  }

  const members = memberships
    .filter((row) => row.club_id === club.id)
    .map((row) => {
      const student = users.find((item) => item.id === row.student_id);
      return {
        membership_id: row.id,
        student_id: row.student_id,
        student_name: student?.name ?? 'Unknown student',
        student_email: student?.email ?? '',
        status: row.status,
        applied_at: row.applied_at,
        reviewed_at: row.reviewed_at,
      };
    })
    .sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at));

  return clone({ club: { id: club.id, name: club.name }, members });
}

export async function createClub(payload) {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);

  return commit((state) => {
    const club = {
      id: nextId('clubs'),
      name: payload.name,
      description: payload.description || null,
      category: payload.category,
      admin_id: admin.id,
      faculty_coordinator_id: Number(payload.faculty_coordinator_id),
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    state.clubs.push(club);
    return clone(club);
  });
}

/* -- Not in the backend yet --------------------------------------------- */

/** BACKEND-PENDING: no route approves or rejects a membership request. */
export async function reviewMembership(membershipId, decision) {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);
  const { memberships, clubs } = snapshot();

  const membership = memberships.find(
    (row) => String(row.id) === String(membershipId),
  );
  if (!membership) {
    throw new ApiError('Membership request not found.', { status: 404 });
  }

  const club = clubs.find((row) => row.id === membership.club_id);
  if (!club || club.admin_id !== admin.id) {
    throw new ApiError('You do not administer this club.', { status: 403 });
  }
  if (membership.status !== MEMBERSHIP_STATUS.PENDING) {
    throw new ApiError('This request has already been reviewed.', {
      status: 400,
    });
  }

  const status =
    decision === 'approve'
      ? MEMBERSHIP_STATUS.APPROVED
      : MEMBERSHIP_STATUS.REJECTED;

  return commit((state) => {
    const row = state.memberships.find((item) => item.id === membership.id);
    row.status = status;
    row.reviewed_at = new Date().toISOString();

    pushNotification(state, {
      user_id: row.student_id,
      type:
        status === MEMBERSHIP_STATUS.APPROVED
          ? 'MEMBERSHIP_APPROVED'
          : 'MEMBERSHIP_REJECTED',
      title:
        status === MEMBERSHIP_STATUS.APPROVED
          ? `You are now a member of ${club.name}`
          : `${club.name} declined your membership request`,
      body:
        status === MEMBERSHIP_STATUS.APPROVED
          ? 'You can now see club events and announcements.'
          : 'You can apply again when intake reopens.',
      link: `/app/clubs/${club.id}`,
    });

    return clone(row);
  });
}

/** BACKEND-PENDING: no route lists the clubs a club admin owns. */
export async function listAdminClubs() {
  await latency();
  const admin = requireRole(ROLES.CLUB_ADMIN);
  const { clubs, memberships } = snapshot();

  const rows = clubs
    .filter((club) => club.admin_id === admin.id)
    .map((club) => {
      const clubMemberships = memberships.filter(
        (row) => row.club_id === club.id,
      );
      return {
        ...club,
        member_count: clubMemberships.filter(
          (row) => row.status === MEMBERSHIP_STATUS.APPROVED,
        ).length,
        pending_count: clubMemberships.filter(
          (row) => row.status === MEMBERSHIP_STATUS.PENDING,
        ).length,
      };
    });

  return clone(rows);
}

/** BACKEND-PENDING: no route lists faculty coordinators for club creation. */
export async function listCoordinators() {
  await latency();
  requireRole(ROLES.CLUB_ADMIN);
  return clone(
    snapshot()
      .users.filter((user) => user.role === ROLES.FACULTY_COORDINATOR)
      .map(({ id, name, email }) => ({ id, name, email })),
  );
}
