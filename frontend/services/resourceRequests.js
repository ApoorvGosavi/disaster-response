import { apiFetch } from './api';

export function listResourceRequests() {
  return apiFetch('/resource-requests');
}

export function createResourceRequest(payload) {
  return apiFetch('/resource-requests', { method: 'POST', body: JSON.stringify(payload) });
}

export function patchResourceRequestStatus(id, status) {
  return apiFetch(`/resource-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
