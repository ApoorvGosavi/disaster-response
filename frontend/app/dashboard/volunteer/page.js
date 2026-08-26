import { requireDashboardRole } from '../../../lib/requireDashboardRole';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import VolunteerTasks from '../../../components/dashboard/volunteer/VolunteerTasks';

export const metadata = { title: 'Volunteer Dashboard' };

export default async function VolunteerDashboard() {
  const { user, profile } = await requireDashboardRole('volunteer');

  return (
    <DashboardShell
      role="volunteer"
      title={`Welcome, ${profile.full_name || 'Volunteer'}`}
      subtitle="Available and assigned tasks"
    >
      <VolunteerTasks userId={user.id} />
    </DashboardShell>
  );
}
