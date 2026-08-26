import AuthShell from '../../../components/auth/AuthShell';
import LoginForm from '../../../components/auth/LoginForm';

export const metadata = { title: 'Sign in — Disaster Response Network' };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Command Access"
      title="Sign in"
      description="Enter your credentials to reach your dashboard."
    >
      <LoginForm />
    </AuthShell>
  );
}
