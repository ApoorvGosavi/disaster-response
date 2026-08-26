'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import PasswordInput from '../ui/PasswordInput';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

// This page is reached via the link Supabase emails, which
// establishes a temporary "recovery" session client-side. We just
// call updateUser({ password }) against that session — Supabase
// handles verifying the recovery token was valid.
export default function ResetPasswordForm() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Could not reset password. The link may have expired.');
      return;
    }

    router.push('/login');
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Alert tone="error">{error}</Alert>

      <PasswordInput
        id="password"
        label="New password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint="At least 8 characters."
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button type="submit" loading={loading}>
        {loading ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}
