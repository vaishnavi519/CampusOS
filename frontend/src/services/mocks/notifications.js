import api from "../api.js";
import { ApiError } from "../errors.js"
import { nextId } from "./store.js";

// Handle API errors
function handleError(error) {
  if (error instanceof ApiError) throw error;

  const status = error.response?.status || 500;
  const data = error.response?.data;

  throw new ApiError(
    data?.message ||
      data?.detail ||
      "Unable to load notifications. Please try again.",
    { status }
  );
}

// Common API request handler
async function request(callback) {
  try {
    const response = await callback();
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

// Create a local notification for existing mock services
export function pushNotification(state, notification) {
  const row = {
    id: nextId("notifications"),
    read: false,
    created_at: new Date().toISOString(),
    ...notification,
  };

  state.notifications.push(row);
  return row;
}

// Get all notifications for the logged-in user
export async function listNotifications() {
  return request(() => api.get("/notifications"));
}

// Get unread notification count
export async function countUnread() {
  const data = await request(() =>
    api.get("/notifications/unread-count")
  );

  return data.count;
}

// Mark one notification as read
export async function markRead(id) {
  const data = await request(() =>
    api.patch(`/notifications/${id}/read`)
  );

  return data.notification;
}

// Mark all notifications as read
export async function markAllRead() {
  return request(() =>
    api.patch("/notifications/read-all")
  );
}