import AuthShell from '../../../components/auth/AuthShell';

export const metadata = { title: 'Verify your email — Disaster Response Network' };

export default function VerifyEmailPage() {
  return (
    <AuthShell eyebrow="One More Step" title="Verify your email">
      <p className="text-sm text-fog-300">
        We sent a verification link to your inbox. Click it to activate your account,
        then return to <a href="/login" className="font-medium text-signal-teal hover:underline">sign in</a>.
      </p>
    </AuthShell>
  );
}
