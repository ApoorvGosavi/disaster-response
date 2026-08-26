import { createClient } from '../lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Every call to the Express backend goes through here so the
// current Supabase access token is always attached automatically.
// Callers never need to think about tokens.
export async function apiFetch(path, options = {}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = body?.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.code = body?.error?.code;
    err.status = res.status;
    throw err;
  }

  return body.data;
}
