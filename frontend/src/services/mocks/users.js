import { ROLES } from '../../utils/constants.js';
import { requireRole } from './session.js';
import { clone, latency, snapshot } from './store.js';

/**
 * BACKEND-PENDING: no account-management endpoint is documented.
 * Demo-only, so the System Administrator flow can be demonstrated end to end.
 * In live mode this raises NotImplementedError and the screen says so.
 */
export async function listUsers() {
  await latency(220);
  requireRole(ROLES.SYSTEM_ADMIN);

  const { users, clubs, memberships, registrations } = snapshot();

  return clone(
    users
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        clubs_administered: clubs.filter((row) => row.admin_id === user.id).length,
        memberships: memberships.filter((row) => row.student_id === user.id).length,
        registrations: registrations.filter((row) => row.student_id === user.id)
          .length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  );
}
