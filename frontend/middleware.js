import { NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { dashboardPathForRole } from './lib/roles';

// IMPORTANT: this middleware is a UX convenience layer only.
// It stops a logged-out user from momentarily seeing a protected
// page's shell, and bounces a logged-in user away from a
// dashboard that isn't theirs. It is NOT the security boundary —
// that's requireAuth/requireRole on the Express API and RLS on
// the database. Someone could disable JS or hit the API directly
// and none of this file would run; the backend must still refuse
// them independently.

const PROTECTED_PREFIXES = ['/dashboard'];
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export async function middleware(request) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    // already logged in — don't show them the login/register form again
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = dashboardPathForRole(profile?.role);
    return NextResponse.redirect(url);
  }

  if (isProtected && user && pathname.startsWith('/dashboard/')) {
    const segment = pathname.split('/')[2]; // e.g. "citizen" from /dashboard/citizen
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (segment && profile?.role && segment !== profile.role) {
      const url = request.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
