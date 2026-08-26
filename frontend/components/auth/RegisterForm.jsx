'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import Input from '../ui/Input';
import PasswordInput from '../ui/PasswordInput';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// NOTE ON ROLE SELECTION:
// Admin is never offered here — there is no self-registration path
// to it at all. Authority and Hospital ARE offered because a real
// deployment needs a way for those users to signal intent, but
// selecting one does NOT grant the role: the account is created as
// 'citizen' (see database trigger handle_new_user) and a pending
// row is written to role_upgrade_requests for an admin to review.
// This keeps the "safest practical implementation" promise: no
// client-submitted role value is ever trusted directly by the DB.
const ROLE_OPTIONS = [
  { value: 'citizen', label: 'Citizen', privileged: false },
  { value: 'volunteer', label: 'Volunteer', privileged: false },
  { value: 'rescuer', label: 'Rescuer / First Responder', privileged: false },
  { value: 'authority', label: 'Authority (requires approval)', privileged: true },
  { value: 'hospital', label: 'Hospital (requires approval)', privileged: true },
];

export default function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    organization: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedRoleMeta = ROLE_OPTIONS.find((r) => r.value === form.role);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!EMAIL_RE.test(form.email)) errors.email = 'Enter a valid email address.';
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (selectedRoleMeta?.privileged && !form.organization.trim()) {
      errors.organization = 'Organization is required for this role.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone,
          role: form.role,
          organization: form.organization || null,
        },
      },
    });
    setLoading(false);

    if (error) {
      setFormError(error.message || 'Registration failed. Please try again.');
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <Alert tone="success">
        Account created. Check your email to verify your address before signing in.
        {selectedRoleMeta?.privileged && (
          <> Your request for <strong>{selectedRoleMeta.label.split(' (')[0]}</strong> access has
          been submitted for admin review — you'll have Citizen access in the meantime.</>
        )}{' '}
        <a href="/login" className="underline">Go to sign in</a>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Alert tone="error">{formError}</Alert>

      <Input
        id="fullName"
        label="Full name"
        autoComplete="name"
        value={form.fullName}
        onChange={(e) => update('fullName', e.target.value)}
        error={fieldErrors.fullName}
      />

      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={(e) => update('email', e.target.value)}
        error={fieldErrors.email}
      />

      <Input
        id="phone"
        label="Phone (optional)"
        type="tel"
        autoComplete="tel"
        value={form.phone}
        onChange={(e) => update('phone', e.target.value)}
      />

      <div>
        <label htmlFor="role" className="mb-1.5 block text-xs font-medium uppercase tracking-tag text-fog-500">
          Role
        </label>
        <select
          id="role"
          value={form.role}
          onChange={(e) => update('role', e.target.value)}
          className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-fog-100 focus:border-signal-teal focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {selectedRoleMeta?.privileged && (
          <p className="mt-1.5 text-xs text-signal-amber">
            This role requires admin approval. You'll register with Citizen access and be upgraded once approved.
          </p>
        )}
      </div>

      {selectedRoleMeta?.privileged && (
        <Input
          id="organization"
          label="Organization"
          value={form.organization}
          onChange={(e) => update('organization', e.target.value)}
          error={fieldErrors.organization}
          placeholder="e.g. City General Hospital"
        />
      )}

      <PasswordInput
        id="password"
        autoComplete="new-password"
        value={form.password}
        onChange={(e) => update('password', e.target.value)}
        error={fieldErrors.password}
        hint="At least 8 characters."
      />

      <PasswordInput
        id="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={(e) => update('confirmPassword', e.target.value)}
        error={fieldErrors.confirmPassword}
      />

      <Button type="submit" loading={loading}>
        {loading ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-sm text-fog-500">
        Already registered?{' '}
        <a href="/login" className="font-medium text-signal-teal hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
