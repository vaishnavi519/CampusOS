import api from "../api.js";
import { ApiError } from "../errors.js";

function handleError(error) {
  if (error instanceof ApiError) throw error;

  const status = error.response?.status || 500;
  const data = error.response?.data;

  throw new ApiError(
    data?.message ||
      data?.detail ||
      "Unable to load your registrations. Please try again.",
    { status }
  );
}

async function request(callback) {
  try {
    const response = await callback();
    return response.data;
  } catch (error) {
    handleError(error);
  }
}

export async function listMyRegistrations() {
  return request(() => api.get("/my-registrations"));
}

export async function getMyRegistrations() {
  return listMyRegistrations();
}

export async function cancelRegistration(registrationId) {
  return request(() =>
    api.patch(`/registrations/${registrationId}/cancel`)
  );
}

export async function registerForEvent(eventId) {
  return request(() =>
    api.post(`/events/${eventId}/register`)
  );
}