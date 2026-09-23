import { get, patch } from './client.js';

/**
 * Live implementations of the notifications API.
 *
 *   GET   /api/notifications
 *   PATCH /api/notifications/:id/read
 *
 * MySQL sends `is_read` as 0/1. The UI works in booleans, so the flag is
 * normalised to `read` here rather than in every screen that renders a row.
 */

const toBoolean = (value) =>
  value === true || value === 1 || value === '1' || value === 'true';

function normalizeNotification(row) {
  return {
    id: row.id,
    user_id: row.user_id ?? null,
    type: row.type ?? 'GENERAL',
    title: row.title ?? 'Notification',
    // The backend names the long text `message`; the UI has always called it
    // `body`. Both are accepted so neither spelling breaks the list.
    body: row.body ?? row.message ?? null,
    link: row.link ?? null,
    read: toBoolean(row.is_read ?? row.read),
    created_at: row.created_at ?? null,
  };
}

/** GET /api/notifications -> Notification[], newest first. Role: any. */
export async function listNotifications(options) {
  const data = await get('/notifications', options);
  return (data.notifications ?? [])
    .map(normalizeNotification)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/** Unread badge count. Derived from the list — there is no count endpoint. */
export async function countUnread(options) {
  const rows = await listNotifications(options);
  return rows.filter((row) => !row.read).length;
}

/** PATCH /api/notifications/:id/read. Role: any (own notifications). */
export async function markRead(id) {
  return patch(`/notifications/${id}/read`);
}

/**
 * No bulk endpoint exists, so this marks each unread row individually.
 * `allSettled` keeps one failure from hiding the rest of the work.
 */
export async function markAllRead() {
  const unread = (await listNotifications()).filter((row) => !row.read);
  const results = await Promise.allSettled(
    unread.map((row) => markRead(row.id)),
  );

  const updated = results.filter((item) => item.status === 'fulfilled').length;
  const failed = results.length - updated;
  if (updated === 0 && failed > 0) throw results[0].reason;

  return { updated, failed };
}
