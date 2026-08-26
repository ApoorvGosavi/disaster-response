import AuthShell from '../../../components/auth/AuthShell';
import ResetPasswordForm from '../../../components/auth/ResetPasswordForm';

export const metadata = { title: 'Set new password — Disaster Response Network' };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Set a new password"
      description="Choose a new password for your account."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
