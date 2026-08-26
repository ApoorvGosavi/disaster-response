import { requireDashboardRole } from '../../../lib/requireDashboardRole';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import RescuerAssignments from '../../../components/dashboard/rescuer/RescuerAssignments';

export const metadata = { title: 'Rescuer Dashboard' };

export default async function RescuerDashboard() {
  const { profile } = await requireDashboardRole('rescuer');

  return (
    <DashboardShell
      role="rescuer"
      title={`Rescuer — ${profile.full_name || ''}`}
      subtitle="Assigned incidents and team status"
    >
      <RescuerAssignments />
    </DashboardShell>
  );
}
