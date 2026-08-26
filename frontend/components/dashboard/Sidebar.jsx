'use client';

import { NAV_ITEMS } from '../../lib/navigation';

// Purely presentational nav — the actual access control lives in
// middleware.js, requireDashboardRole, and the backend. This
// component being role-scoped just means a citizen never even SEES
// a link to /dashboard/admin; it is not itself a security boundary.
export default function Sidebar({ role }) {
  const items = NAV_ITEMS[role] || [];

  return (
    <nav className="hidden w-56 shrink-0 border-r border-ink-700 bg-ink-900 p-4 lg:block">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-fog-300 hover:bg-ink-800 hover:text-fog-100"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
