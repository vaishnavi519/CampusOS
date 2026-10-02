import api from "../api.js";
import { ApiError } from "../errors.js";

function handleError(error) {
  if (error instanceof ApiError) throw error;

  const status = error.response?.status || 500;
  const data = error.response?.data;

  throw new ApiError(
    data?.message ||
      data?.detail ||
      "Unable to load your participation. Please try again.",
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

export async function listMyParticipation() {
  return request(() => api.get("/reports/my-participation"));
}

export async function getMyParticipation() {
  return listMyParticipation();
}