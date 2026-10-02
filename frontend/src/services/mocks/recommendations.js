import api from "../api.js";
import { ApiError } from "../errors.js";

function handleError(error) {
  if (error instanceof ApiError) {
    throw error;
  }

  const status = error.response?.status || 500;
  const data = error.response?.data;

  const message =
    data?.message ||
    data?.detail ||
    "Unable to load recommended events. Please try again.";

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

/**
 * Get recommended events for the logged-in student.
 * Django endpoint: GET /api/recommendations
 */
export async function listRecommendations() {
  const recommendations = await request(() =>
    api.get("/recommendations")
  );

  return recommendations.map((event) => ({
    id: event.id,
    event_id: event.event_id ?? event.id,
    title: event.title,
    club_id: event.club_id,
    club_name: event.club_name ?? null,
    event_date: event.event_date,
    event_time: event.event_time,
    venue: event.venue,
    reason: event.reason ?? "Recommended for you",
  }));
}

/**
 * Alias for components that call getRecommendations().
 */
export async function getRecommendations() {
  return listRecommendations();
}