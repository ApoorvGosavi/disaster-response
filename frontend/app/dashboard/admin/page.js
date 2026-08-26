import { requireDashboardRole } from '../../../lib/requireDashboardRole';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import { Card, StatGrid, ListRow, EmptyState } from '../../../components/dashboard/Widgets';

export const metadata = { title: 'Admin Dashboard' };

const pendingRoleRequests = [
  { title: 'jane@citygeneral.org — requesting Hospital', meta: 'Pending' },
  { title: 'raj@cityauth.gov — requesting Authority', meta: 'Pending' },
];

const auditEvents = [
  { title: 'login_failure — unknown@example.com', meta: '2m ago', severity: 'medium' },
  { title: 'role_change_approved — jane@citygeneral.org', meta: '1h ago' },
];

export default async function AdminDashboard() {
  const { profile } = await requireDashboardRole('admin');

  return (
    <DashboardShell role="admin" title={`Admin — ${profile.full_name || ''}`} subtitle="User management and system oversight">
      <div className="space-y-6">
        <StatGrid
          stats={[
            { label: 'Total Users', value: 482 },
            { label: 'Pending Requests', value: pendingRoleRequests.length },
            { label: 'Active Sessions', value: 96 },
            { label: 'Flagged Events', value: 3 },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            title="Role Upgrade Requests"
            action={<span className="text-xs text-fog-500">Approve via /api/users/role-upgrade-request review</span>}
          >
            {pendingRoleRequests.length
              ? pendingRoleRequests.map((r) => <ListRow key={r.title} {...r} />)
              : <EmptyState text="No pending requests." />}
          </Card>

          <Card title="User Management">
            <p className="text-sm text-fog-500">
              Activate, deactivate, and review accounts across all roles. Backed by admin-only
              RLS policies on <code className="font-mono text-fog-300">profiles</code>.
            </p>
          </Card>

          <Card title="Audit Log">
            {auditEvents.length ? auditEvents.map((e) => <ListRow key={e.title} {...e} />) : <EmptyState text="No recent events." />}
          </Card>

          <Card title="Security Overview">
            <ListRow title="Rate limit hits (24h)" meta="14" />
            <ListRow title="Failed logins (24h)" meta="7" severity="medium" />
            <ListRow title="Disabled accounts" meta="2" />
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
