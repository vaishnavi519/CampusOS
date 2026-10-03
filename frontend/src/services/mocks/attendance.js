import api from "../api.js";
import { ApiError } from "../errors.js";

function handleError(error) {
  if (error instanceof ApiError) throw error;

  const status = error.response?.status || 500;
  const data = error.response?.data;

  throw new ApiError(
    data?.message ||
      data?.detail ||
      "Unable to update attendance. Please try again.",
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

export async function listAttendance(eventId) {
  return request(() =>
    api.get(`/events/${eventId}/attendance`)
  );
}

export async function markAttendance(eventId, { student_id, status }) {
  const data = await request(() =>
    api.post(`/events/${eventId}/attendance/mark`, {
      student_id,
      status,
    })
  );

  return data.attendance;
}