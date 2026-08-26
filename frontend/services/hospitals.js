import { apiFetch } from './api';

export function listHospitals() {
  return apiFetch('/hospitals');
}

export function updateHospital(id, payload) {
  return apiFetch(`/hospitals/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}
