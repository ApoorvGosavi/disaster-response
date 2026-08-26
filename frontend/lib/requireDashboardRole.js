import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

// Belt-and-suspenders check run inside each dashboard's server
// component, in addition to middleware.js. middleware.js already
// redirects mismatched roles away, but a Server Component should
// never assume a request definitely passed through middleware
// (e.g. future route changes, edge cases) — so it re-verifies here
// against a fresh database read before rendering anything.
export async function requireDashboardRole(expectedRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.is_active) {
    redirect('/login');
  }

  if (profile.role !== expectedRole) {
    redirect('/unauthorized');
  }

  return { user, profile };
}
