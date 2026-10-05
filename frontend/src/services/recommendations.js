import { apiRequest } from './api.js';

export async function listRecommendations() {
  const data = await apiRequest('/recommendations');
  return data.recommendations ?? [];
}