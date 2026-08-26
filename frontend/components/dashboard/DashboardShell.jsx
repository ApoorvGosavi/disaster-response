import LogoutButton from './LogoutButton';
import Sidebar from './Sidebar';

const ROLE_LABEL = {
  citizen: 'Citizen',
  rescuer: 'Rescuer',
  authority: 'Authority',
  hospital: 'Hospital',
  volunteer: 'Volunteer',
  admin: 'Admin',
};

export default function DashboardShell({ role, title, subtitle, children }) {
  return (
    <div className="flex min-h-screen bg-ink-950 font-body">
      <Sidebar role={role} />
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ink-700 bg-ink-900 px-6 py-4 lg:px-10">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-tag text-signal-teal">
              {ROLE_LABEL[role] || role} Console
            </p>
            <h1 className="font-display text-xl font-medium text-fog-100">{title}</h1>
            {subtitle && <p className="text-sm text-fog-500">{subtitle}</p>}
          </div>
          <LogoutButton />
        </header>
        <main className="px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
