import { apiFetch } from './api';

export function listAssignments() {
  return apiFetch('/rescue-assignments');
}

export function listMyAssignments() {
  return apiFetch('/rescue-assignments/my');
}

export function createAssignment(incidentId, rescueTeamId) {
  return apiFetch('/rescue-assignments', {
    method: 'POST',
    body: JSON.stringify({ incident_id: incidentId, rescue_team_id: rescueTeamId }),
  });
}

export function patchAssignmentStatus(id, status) {
  return apiFetch(`/rescue-assignments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
