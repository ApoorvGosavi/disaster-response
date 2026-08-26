import { requireDashboardRole } from '../../../lib/requireDashboardRole';
import DashboardShell from '../../../components/dashboard/DashboardShell';
import HospitalCapacity from '../../../components/dashboard/hospital/HospitalCapacity';
import HospitalResourceRequests from '../../../components/dashboard/hospital/HospitalResourceRequests';

export const metadata = { title: 'Hospital Dashboard' };

export default async function HospitalDashboard() {
  const { user, profile } = await requireDashboardRole('hospital');

  return (
    <DashboardShell
      role="hospital"
      title={`${profile.organization || 'Hospital'} Resource Console`}
      subtitle="Capacity and incoming cases"
    >
      <div className="space-y-6">
        <HospitalCapacity userId={user.id} />
        <HospitalResourceRequests />
      </div>
    </DashboardShell>
  );
}
