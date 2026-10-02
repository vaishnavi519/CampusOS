import api from "../api.js";
import { ApiError } from "../errors.js";

async function request(callback) {
  try {
    const response = await callback();
    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data;

    throw new ApiError(
      data?.message ||
      data?.detail ||
      "Unable to load accounts.",
      { status }
    );
  }
}

export async function listUsers() {
  return request(() => api.get("/users"));
}