// Single source of truth for role-based navigation. Each entry is
// { label, href }. Only items relevant to the CURRENT workflow slice
// point at real pages; the rest point at each role's dashboard with
// a query param and are rendered as "coming soon" inside that page
// section, so nothing links to a 404 or exposes unbuilt admin tools.

export const NAV_ITEMS = {
  citizen: [
    { label: 'Dashboard', href: '/dashboard/citizen' },
    { label: 'Report Emergency', href: '/dashboard/citizen#report' },
    { label: 'My Incidents', href: '/dashboard/citizen#my-incidents' },
    { label: 'Emergency Map', href: '/dashboard/citizen#map' },
    { label: 'Notifications', href: '/dashboard/citizen#notifications' },
  ],
  rescuer: [
    { label: 'Dashboard', href: '/dashboard/rescuer' },
    { label: 'Assigned Incidents', href: '/dashboard/rescuer#assignments' },
    { label: 'Emergency Map', href: '/dashboard/rescuer#map' },
    { label: 'Notifications', href: '/dashboard/rescuer#notifications' },
  ],
  authority: [
    { label: 'Command Dashboard', href: '/dashboard/authority' },
    { label: 'Incidents', href: '/dashboard/authority#incidents' },
    { label: 'Disaster Map', href: '/dashboard/authority#map' },
    { label: 'Rescue Teams', href: '/dashboard/authority#teams' },
    { label: 'Hospitals', href: '/dashboard/authority#hospitals' },
    { label: 'Shelters', href: '/dashboard/authority#shelters' },
  ],
  hospital: [
    { label: 'Dashboard', href: '/dashboard/hospital' },
    { label: 'Bed & ICU Availability', href: '/dashboard/hospital#capacity' },
  ],
  volunteer: [
    { label: 'Dashboard', href: '/dashboard/volunteer' },
    { label: 'Available Tasks', href: '/dashboard/volunteer#tasks' },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin' },
    { label: 'Role Requests', href: '/dashboard/admin#role-requests' },
    { label: 'Audit Logs', href: '/dashboard/admin#audit' },
  ],
};
