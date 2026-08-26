// Browser client — used inside client components ("use client").
// Uses the anon key only, which is safe to expose: it has no
// power beyond what RLS policies grant an authenticated user.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
