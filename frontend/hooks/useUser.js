'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

// Client-side hook exposing { user, profile, loading }.
// `profile` carries the role — dashboards and UI should read the
// role from here (or better, from a server component) for display
// purposes only. Actual authorization decisions must still be
// re-checked by the Express API / RLS; this hook is not a security
// boundary, same caveat as middleware.js.
export function useUser() {
  const [state, setState] = useState({ user: null, profile: null, loading: true });
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMounted) setState({ user: null, profile: null, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (isMounted) setState({ user, profile, loading: false });
    }

    load();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
