import { apiFetch } from './api';

export function listShelters() {
  return apiFetch('/shelters');
}
