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
      "Unable to complete the account request.",
      { status }
    );
  }
}

export async function listUsers() {
  return request(() => api.get("/users"));
}

export async function createUser(payload) {
  return request(() => api.post("/users/create", payload));
}

export async function resetUserPassword(userId, payload) {
  return request(() =>
    api.patch(`/users/${userId}/reset-password`, payload)
  );
}