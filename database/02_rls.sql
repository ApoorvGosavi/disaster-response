-- ============================================================
-- 02_rls.sql — Row Level Security policies
-- Run after 01_schema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Helper: resolve the caller's role once, via a SECURITY DEFINER
-- function, so policies can reference it without each policy
-- re-querying profiles (and without recursive-policy issues,
-- since this function itself bypasses RLS internally).
-- ------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

-- Everyone can read their own profile row.
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

-- Authority/Admin need visibility into other users for
-- rescuer assignment, hospital contacts, etc. Kept role-gated
-- (not "any authenticated user") — tighten to per-incident scope
-- once incident assignment logic exists.
create policy "profiles_select_authority_admin"
on public.profiles for select
using (public.current_user_role() in ('authority', 'admin'));

-- Users can update their own row (name, phone, organization).
-- Role changes are blocked separately by a trigger below —
-- RLS alone can't restrict *which columns* change, only *which
-- rows* are touched.
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Admins can update any profile (deactivate accounts, approve
-- role changes, etc).
create policy "profiles_update_admin"
on public.profiles for update
using (public.current_user_role() = 'admin');

-- No client-side inserts/deletes: profile rows are only ever
-- created by the handle_new_user trigger (SECURITY DEFINER) and
-- deleted via the auth.users cascade. Omitting insert/delete
-- policies means both are denied by default under RLS.

-- ------------------------------------------------------------
-- Prevent a user from smuggling role='admin' through the
-- "update own profile" policy above. RLS checks *row* access,
-- not *column* values, so this trigger is the actual guardrail
-- against self-escalation.
-- ------------------------------------------------------------
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role <> old.role and public.current_user_role() <> 'admin' then
    raise exception 'Role changes must go through role_upgrade_requests and admin approval';
  end if;
  if new.is_verified <> old.is_verified and public.current_user_role() <> 'admin' then
    raise exception 'Verification status can only be changed by an admin';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_role_self_escalation();

-- ============================================================
-- ROLE UPGRADE REQUESTS
-- ============================================================
alter table public.role_upgrade_requests enable row level security;

-- A user can file a request for themselves only.
create policy "role_requests_insert_own"
on public.role_upgrade_requests for insert
with check (auth.uid() = user_id);

-- A user can see the status of their own requests.
create policy "role_requests_select_own"
on public.role_upgrade_requests for select
using (auth.uid() = user_id);

-- Admins can see and act on every request.
create policy "role_requests_select_admin"
on public.role_upgrade_requests for select
using (public.current_user_role() = 'admin');

create policy "role_requests_update_admin"
on public.role_upgrade_requests for update
using (public.current_user_role() = 'admin');

-- ============================================================
-- AUDIT LOGS
-- Written exclusively by the Express backend via the
-- service-role key, which bypasses RLS entirely — so there is
-- deliberately NO insert policy for regular authenticated users.
-- ============================================================
alter table public.audit_logs enable row level security;

create policy "audit_logs_select_admin"
on public.audit_logs for select
using (public.current_user_role() = 'admin');

-- ============================================================
-- INCIDENTS
-- Citizens: create + read their own reports.
-- Authority/Admin: full visibility and management.
-- Rescuers: read incidents (assignment-scoped access can be
-- tightened once a rescue_assignments table exists).
-- ============================================================
alter table public.incidents enable row level security;

create policy "incidents_select_own"
on public.incidents for select
using (auth.uid() = reported_by);

create policy "incidents_select_responders"
on public.incidents for select
using (public.current_user_role() in ('authority', 'admin', 'rescuer', 'volunteer'));

create policy "incidents_insert_own"
on public.incidents for insert
with check (auth.uid() = reported_by);

create policy "incidents_update_authority_admin"
on public.incidents for update
using (public.current_user_role() in ('authority', 'admin'));

-- ============================================================
-- RESCUE TEAMS — managed by authority/admin, readable by
-- responders who need to coordinate.
-- ============================================================
alter table public.rescue_teams enable row level security;

create policy "rescue_teams_select_responders"
on public.rescue_teams for select
using (public.current_user_role() in ('authority', 'admin', 'rescuer'));

create policy "rescue_teams_write_authority_admin"
on public.rescue_teams for all
using (public.current_user_role() in ('authority', 'admin'))
with check (public.current_user_role() in ('authority', 'admin'));

-- ============================================================
-- HOSPITALS — a hospital user manages only their own resource
-- row; authority/admin can see all for coordination.
-- ============================================================
alter table public.hospitals enable row level security;

create policy "hospitals_select_all_responders"
on public.hospitals for select
using (public.current_user_role() in ('authority', 'admin', 'hospital', 'rescuer'));

create policy "hospitals_manage_own"
on public.hospitals for update
using (auth.uid() = managed_by)
with check (auth.uid() = managed_by);

create policy "hospitals_insert_own"
on public.hospitals for insert
with check (auth.uid() = managed_by or public.current_user_role() = 'admin');

create policy "hospitals_manage_admin"
on public.hospitals for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- ============================================================
-- SHELTERS — readable by everyone authenticated (citizens need
-- to find nearby shelters); writable by managers/authority/admin.
-- ============================================================
alter table public.shelters enable row level security;

create policy "shelters_select_all_authenticated"
on public.shelters for select
using (auth.uid() is not null);

create policy "shelters_manage_own"
on public.shelters for update
using (auth.uid() = managed_by or public.current_user_role() in ('authority', 'admin'))
with check (auth.uid() = managed_by or public.current_user_role() in ('authority', 'admin'));

create policy "shelters_insert"
on public.shelters for insert
with check (auth.uid() = managed_by or public.current_user_role() in ('authority', 'admin'));
