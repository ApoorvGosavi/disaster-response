import { apiFetch } from './api';

export function listRescueTeams() {
  return apiFetch('/rescue-teams');
}
