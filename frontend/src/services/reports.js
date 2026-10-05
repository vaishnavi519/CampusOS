import { apiRequest } from './api.js';

export async function getMyParticipation() {
  const data = await apiRequest('/reports/my-participation');

  return {
    summary: data.summary ?? {},
    report: data.report ?? [],
  };
}