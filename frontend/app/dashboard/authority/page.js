import { requireDashboardRole } from '../../../lib/requireDashboardRole';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import AuthorityIncidents from '../../../components/dashboard/authority/AuthorityIncidents';
import AuthorityResources from '../../../components/dashboard/authority/AuthorityResources';
import AuthorityResourceRequests from '../../../components/dashboard/authority/AuthorityResourceRequests';
import AuthorityPostTask from '../../../components/dashboard/authority/AuthorityPostTask';

export const metadata = { title: 'Authority Dashboard' };

export default async function AuthorityDashboard() {
  const { profile } = await requireDashboardRole('authority');

  return (
    <DashboardShell
      role="authority"
      title={`Authority Command — ${profile.organization || profile.full_name || ''}`}
      subtitle="Disaster overview and coordination"
    >
      <div className="space-y-6">
        <AuthorityIncidents />
        <AuthorityResources />
        <div className="grid gap-6 lg:grid-cols-2">
          <AuthorityResourceRequests />
          <AuthorityPostTask />
        </div>
      </div>
    </DashboardShell>
  );
}
