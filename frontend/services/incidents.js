import { apiFetch } from './api';

export function listIncidents() {
  return apiFetch('/incidents');
}

export function getIncident(id) {
  return apiFetch(`/incidents/${id}`);
}

export function getIncidentUpdates(id) {
  return apiFetch(`/incidents/${id}/updates`);
}

export function createIncident(payload) {
  return apiFetch('/incidents', { method: 'POST', body: JSON.stringify(payload) });
}

export function patchIncidentStatus(id, status) {
  return apiFetch(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
