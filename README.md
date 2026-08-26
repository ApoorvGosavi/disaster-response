# Unified Disaster Situation Awareness & Emergency Response System

Authentication and role-based dashboard foundation. Built for a college hackathon, structured so incident management, live mapping, rescue-team allocation, Socket.IO, Redis, and AI/ML services can be layered on top without touching the auth core.

## Stack

- **Frontend**: Next.js (App Router) + React + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth)
- **Real-time / AI**: not yet wired up — see `docs/API.md` for the endpoints they'll plug into

## Roles

`citizen` · `rescuer` · `authority` · `hospital` · `volunteer` · `admin`

`authority`, `hospital`, and `admin` cannot be self-selected at registration — see [Privileged role approval](#privileged-role-approval) below.

## Project layout

```
backend/     Express API — auth middleware, role-gated routes
frontend/    Next.js app — login/register, role-based dashboards
database/    SQL: schema (01) then RLS policies (02)
docs/        API reference and manual testing checklist
```

## Setup

### 1. Supabase project
1. Create a project at supabase.com.
2. In the SQL editor, run `database/01_schema.sql`, then `database/02_rls.sql`.
3. Under **Authentication → Providers**, ensure email/password is enabled and "Confirm email" is on.
4. Under **Authentication → URL Configuration**, set the redirect URL for password reset to `http://localhost:3000/reset-password` (and your deployed URL later).
5. Copy your Project URL, `anon` key, and `service_role` key from **Project Settings → API**.

### 2. Backend
```bash
cd backend
cp .env.example .env       # fill in your Supabase values
npm install
npm run dev                 # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.local.example .env.local   # fill in your Supabase values + API URL
npm install
npm run dev                 # http://localhost:3000
```

## How auth actually works here

- The frontend talks to Supabase Auth **directly** for sign up / sign in / password reset — the Express backend is never handed a plaintext password.
- Sessions live in httpOnly cookies (via `@supabase/ssr`), not `localStorage`, so they aren't reachable by an XSS payload.
- Every request to the Express API carries `Authorization: Bearer <access_token>`. `requireAuth` verifies that token against Supabase itself and re-reads the user's role from `profiles` on every request — a stale or forged claim in the token is never trusted.
- Three independent layers enforce authorization: Next.js `middleware.js` (UX only), Express `requireAuth`/`requireRole` (real enforcement for anything through the API), and Postgres RLS (enforced even if someone bypasses the API and hits Supabase directly with the anon key).

Full endpoint reference: [`docs/API.md`](docs/API.md).

## Privileged role approval

Nobody can submit `role=admin` (or `authority`/`hospital`) from the browser and have it stick. The signup trigger (`handle_new_user` in `01_schema.sql`) always creates new accounts as `citizen`; if someone requested a privileged role at signup, that intent is recorded as a `pending` row in `role_upgrade_requests` instead. An admin reviews and approves it, which is the only path that actually changes `profiles.role` — enforced by a database trigger (`prevent_role_self_escalation`), not just application code.

## Testing

See [`docs/TESTING.md`](docs/TESTING.md) for the full manual checklist (valid/invalid login, expired sessions, role escalation attempts, rate limiting, RLS bypass attempts, etc).

## What's next

This repo intentionally stops at the auth + dashboard shell layer. Planned next: real incident CRUD with severity workflows, Socket.IO for live team communication, a live map (dashboard placeholders are already wired for it), Redis-backed rate limiting (the config is already structured for a drop-in swap — see `backend/src/middleware/rateLimiter.js`), and the Python AI/ML service.
