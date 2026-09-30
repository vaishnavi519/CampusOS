import { ApiError } from '../errors.js';
import { requireUser } from './session.js';
import { clone, commit, latency, nextId, snapshot } from './store.js';

/** Local notification operations used by the mock data layer. */

/**
 * Appends a notification. Called from inside an existing `commit`, so it takes
 * the state it should mutate rather than committing again.
 */
export function pushNotification(state, notification) {
  const row = {
    id: nextId('notifications'),
    read: false,
    created_at: new Date().toISOString(),
    ...notification,
  };
  state.notifications.push(row);
  return row;
}

export async function listNotifications() {
  await latency(200);
  const user = requireUser();
  return clone(
    snapshot()
      .notifications.filter((row) => row.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  );
}

export async function countUnread() {
  const user = requireUser();
  return snapshot().notifications.filter(
    (row) => row.user_id === user.id && !row.read,
  ).length;
}

export async function markRead(id) {
  const user = requireUser();
  return commit((state) => {
    const row = state.notifications.find(
      (item) => String(item.id) === String(id) && item.user_id === user.id,
    );
    if (!row) throw new ApiError('Notification not found.', { status: 404 });
    row.read = true;
    return clone(row);
  });
}

export async function markAllRead() {
  await latency(180);
  const user = requireUser();
  return commit((state) => {
    let changed = 0;
    for (const row of state.notifications) {
      if (row.user_id === user.id && !row.read) {
        row.read = true;
        changed += 1;
      }
    }
    return { updated: changed };
  });
}
