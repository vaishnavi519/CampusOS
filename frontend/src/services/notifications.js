import { apiRequest } from './api.js';

export async function listNotifications() {
  const data = await apiRequest('/notifications');
  return data.notifications ?? [];
}

export async function countUnread() {
  const notifications = await listNotifications();
  return notifications.filter((notification) => !notification.is_read).length;
}

export async function markRead(id) {
  return apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllRead() {
  const notifications = await listNotifications();

  await Promise.all(
    notifications
      .filter((notification) => !notification.is_read)
      .map((notification) => markRead(notification.id)),
  );

  return true;
}

export async function markNotificationRead(id) {
  return markRead(id);
}