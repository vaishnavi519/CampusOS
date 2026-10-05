import { apiRequest } from './api.js';

export async function getPlatformStats() {
  const data = await apiRequest('/stats/platform');
  return data.statistics ?? {};
}