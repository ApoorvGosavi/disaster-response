'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { dashboardPathForRole } from '../../lib/roles';
import Input from '../ui/Input';
import PasswordInput from '../ui/PasswordInput';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errors = {};
    if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      // Generic message on purpose — doesn't confirm whether the
      // email exists, which would help an attacker enumerate accounts.
      setFormError('Invalid email or password. Please try again.');
      return;
    }

    if (data.user && !data.user.email_confirmed_at) {
      setFormError('Please verify your email before signing in. Check your inbox for a verification link.');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .single();

    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      setFormError('This account has been deactivated. Contact an administrator.');
      return;
    }

    const redirectTo = searchParams.get('redirectTo');
    router.push(redirectTo || dashboardPathForRole(profile?.role));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Alert tone="error">{formError}</Alert>

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@agency.gov"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
      />

      <PasswordInput
        id="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />

      <div className="flex items-center justify-end">
        <a href="/forgot-password" className="text-xs font-medium text-signal-teal hover:underline">
          Forgot password?
        </a>
      </div>

      <Button type="submit" loading={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-fog-500">
        No account?{' '}
        <a href="/register" className="font-medium text-signal-teal hover:underline">
          Register
        </a>
      </p>
    </form>
  );
}
