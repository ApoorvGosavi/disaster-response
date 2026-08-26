import AuthShell from '../../../components/auth/AuthShell';
import RegisterForm from '../../../components/auth/RegisterForm';

export const metadata = { title: 'Register — Disaster Response Network' };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="New Registration"
      title="Create an account"
      description="Join the response network. Privileged roles require admin approval."
    >
      <RegisterForm />
    </AuthShell>
  );
}
