// Central place defining which status transitions are legal.
// The backend is the source of truth here — the frontend never
// gets to set an arbitrary status string and have it accepted.

const INCIDENT_TRANSITIONS = {
  reported: ['verified'],
  verified: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['closed'],
  closed: [],
};

const ASSIGNMENT_TRANSITIONS = {
  assigned: ['accepted'],
  accepted: ['en_route'],
  en_route: ['arrived'],
  arrived: ['responding'],
  responding: ['resolved'],
  resolved: [],
};

const VOLUNTEER_TASK_TRANSITIONS = {
  open: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],
  cancelled: [],
};

const RESOURCE_REQUEST_TRANSITIONS = {
  pending: ['fulfilled', 'rejected'],
  fulfilled: [],
  rejected: [],
};

function isValidTransition(map, from, to) {
  if (!map[from]) return false;
  return map[from].includes(to);
}

module.exports = {
  INCIDENT_TRANSITIONS,
  ASSIGNMENT_TRANSITIONS,
  VOLUNTEER_TASK_TRANSITIONS,
  RESOURCE_REQUEST_TRANSITIONS,
  isValidTransition,
};
