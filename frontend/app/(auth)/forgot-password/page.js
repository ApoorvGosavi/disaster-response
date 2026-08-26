import AuthShell from '../../../components/auth/AuthShell';
import ForgotPasswordForm from '../../../components/auth/ForgotPasswordForm';

export const metadata = { title: 'Forgot password — Disaster Response Network' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Reset your password"
      description="Enter the email associated with your account."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
