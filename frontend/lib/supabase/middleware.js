import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Called from the root middleware.ts on every matched request.
// Refreshes the Supabase session cookie (access token renewal)
// and returns { supabaseResponse, user } so middleware.ts can
// make routing decisions based on a *current* session, not a
// stale one from the last page load.
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // IMPORTANT: do not run any code between createServerClient and
  // getUser(). A stray return here can randomly invalidate sessions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user, supabase };
}
