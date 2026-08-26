import { requireDashboardRole } from '../../../lib/requireDashboardRole';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import CitizenIncidents from '../../../components/dashboard/citizen/CitizenIncidents';

export const metadata = { title: 'Citizen Dashboard' };

export default async function CitizenDashboard() {
  const { profile } = await requireDashboardRole('citizen');

  return (
    <DashboardShell
      role="citizen"
      title={`Welcome, ${profile.full_name || 'Citizen'}`}
      subtitle="Report incidents and stay informed"
    >
      <CitizenIncidents />
    </DashboardShell>
  );
}
