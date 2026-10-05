import { apiRequest } from './api.js';

export async function listAttendance(eventId) {
  const data = await apiRequest(`/events/${eventId}/attendance`);
  return data.attendance ?? [];
}

export async function markAttendance(eventId, studentId, status) {
  return apiRequest(`/events/${eventId}/attendance`, {
    method: 'POST',
    body: JSON.stringify({
      student_id: studentId,
      status,
    }),
  });
}