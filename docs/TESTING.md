# Testing Checklist — Authentication & Authorization Foundation

Manual pass before demo, and a starting point for automated tests later.

## Auth happy path
- [ ] Register as `citizen` → profile row created with `role='citizen'`
- [ ] Register as `authority`/`hospital` → account created as `citizen`, row appears in `role_upgrade_requests` with `status='pending'`
- [ ] Verify email link works, `email_confirmed_at` gets set
- [ ] Valid login → redirected to the correct `/dashboard/{role}`
- [ ] Logout → session cleared, redirected to `/login`, `/dashboard/*` now redirects to `/login`
- [ ] Forgot password → email sent regardless of whether the address exists (no enumeration)
- [ ] Reset password via emailed link → can log in with new password

## Auth failure
- [ ] Wrong password → generic "Invalid email or password" (no hint which field was wrong)
- [ ] Login before verifying email → blocked with a clear message
- [ ] Expired/invalid access token sent to `/api/auth/me` → `401 INVALID_TOKEN`
- [ ] Malformed/missing `Authorization` header → `401 UNAUTHORIZED`
- [ ] Login attempt on `is_active=false` account → blocked client-side and server-side (`403 ACCOUNT_DISABLED`)

## Authorization
- [ ] Logged in as `citizen`, manually navigate to `/dashboard/admin` → redirected to `/unauthorized`
- [ ] Logged in as `citizen`, call `POST /api/rescue-teams` directly (e.g. via curl with a valid citizen token) → `403 FORBIDDEN`
- [ ] Attempt to `PUT /api/users/profile` with `{ "role": "admin" }` in the body → role is silently ignored; profile role unchanged
- [ ] Attempt the same role change via a direct Supabase client call (anon key, bypassing Express) → rejected by the `prevent_role_self_escalation` trigger
- [ ] `admin`-only endpoint (e.g. reviewing `role_upgrade_requests`) called by a non-admin → `403 FORBIDDEN`

## Rate limiting & abuse
- [ ] 6 rapid login attempts from the same account → 6th request returns `429 RATE_LIMITED`
- [ ] Rate limit window resets after the configured `windowMs`

## RLS (direct-to-Supabase, bypassing Express entirely)
- [ ] Authenticated citizen queries another user's `profiles` row via the anon-key client → no row returned (unless caller is authority/admin)
- [ ] Authenticated citizen attempts to `insert` directly into `audit_logs` → rejected (no insert policy exists for regular users)
- [ ] Authenticated citizen attempts to read another citizen's `incidents` row they didn't report → no row returned

## Data integrity
- [ ] Two users cannot register with the same email (enforced by Supabase Auth + unique index on `profiles.email`)
- [ ] Deleting a user in `auth.users` cascades to delete their `profiles` row

## Cross-cutting
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never appears in any frontend bundle, network request, or browser devtools
- [ ] CORS: a request from an origin not in `CORS_ALLOWED_ORIGINS` is rejected
- [ ] No password, access token, or refresh token ever appears in `audit_logs.metadata` or server console logs
