import { apiFetch } from './api';

export function listVolunteerTasks() {
  return apiFetch('/volunteer-tasks');
}

export function createVolunteerTask(payload) {
  return apiFetch('/volunteer-tasks', { method: 'POST', body: JSON.stringify(payload) });
}

export function acceptVolunteerTask(id) {
  return apiFetch(`/volunteer-tasks/${id}/accept`, { method: 'PATCH' });
}

export function patchVolunteerTaskStatus(id, status) {
  return apiFetch(`/volunteer-tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
