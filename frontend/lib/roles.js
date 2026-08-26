// Single source of truth for role names and their dashboard paths.
// Mirrors the public.user_role enum in the database — if you add
// a role there, add it here too.

export const ROLES = {
  CITIZEN: 'citizen',
  RESCUER: 'rescuer',
  AUTHORITY: 'authority',
  HOSPITAL: 'hospital',
  VOLUNTEER: 'volunteer',
  ADMIN: 'admin',
};

export const ALL_ROLES = Object.values(ROLES);

export const DASHBOARD_PATH = {
  [ROLES.CITIZEN]: '/dashboard/citizen',
  [ROLES.RESCUER]: '/dashboard/rescuer',
  [ROLES.AUTHORITY]: '/dashboard/authority',
  [ROLES.HOSPITAL]: '/dashboard/hospital',
  [ROLES.VOLUNTEER]: '/dashboard/volunteer',
  [ROLES.ADMIN]: '/dashboard/admin',
};

export function dashboardPathForRole(role) {
  return DASHBOARD_PATH[role] || '/dashboard/citizen';
}

// Roles that require admin approval before being granted —
// cannot be self-selected at registration.
export const PRIVILEGED_ROLES = [ROLES.AUTHORITY, ROLES.HOSPITAL, ROLES.ADMIN];

export const SELF_REGISTERABLE_ROLES = [ROLES.CITIZEN, ROLES.RESCUER, ROLES.VOLUNTEER];
