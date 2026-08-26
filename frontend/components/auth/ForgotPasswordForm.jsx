'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    // Always show the same success state regardless of whether the
    // email exists — avoids leaking which addresses are registered.
    setSent(true);
  }

  if (sent) {
    return (
      <Alert tone="success">
        If an account exists for that address, a password reset link is on its way.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Alert tone="error">{error}</Alert>

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Button type="submit" loading={loading}>
        {loading ? 'Sending…' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-fog-500">
        <a href="/login" className="font-medium text-signal-teal hover:underline">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
