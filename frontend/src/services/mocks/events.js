import api from "../api.js";
import { ApiError } from "../errors.js";

function handleError(error) {
  if (error instanceof ApiError) throw error;

  const status = error.response?.status || 500;
  const data = error.response?.data;

  const message =
    data?.message ||
    data?.detail ||
    "Unable to load events. Please try again.";

  throw new ApiError(message, { status });
}

async function request(callback) {
  try {
    const response = await callback();
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function listPublishedEvents() {
  return request(() => api.get("/events"));
}

export async function getPublishedEvent(id) {
  return request(() => api.get(`/events/${id}`));
}

export async function createEvent(payload) {
  const data = await request(() => api.post("/events", payload));
  return data.event;
}

export async function submitEvent(id) {
  return request(() => api.patch(`/events/${id}/submit`));
}

export async function listPendingEvents() {
  return request(() => api.get("/events/pending"));
}

export async function approveEvent(id) {
  return request(() => api.patch(`/events/${id}/approve`));
}

export async function rejectEvent(id, reason) {
  return request(() =>
    api.patch(`/events/${id}/reject`, { reason })
  );
}

export async function publishEvent(id) {
  return request(() => api.patch(`/events/${id}/publish`));
}

export async function listClubAdminEvents() {
  return request(() => api.get("/my-events"));
}

export async function listApprovedEvents() {
  return request(() => api.get("/events/approved"));
}

export async function getEvent(id) {
  return request(() => api.get(`/events/${id}`));
}