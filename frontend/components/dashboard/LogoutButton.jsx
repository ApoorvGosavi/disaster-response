'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-md border border-ink-600 px-3 py-1.5 text-xs font-medium uppercase tracking-tag text-fog-300 hover:border-signal-crimson/50 hover:text-signal-crimson"
    >
      Sign out
    </button>
  );
}
