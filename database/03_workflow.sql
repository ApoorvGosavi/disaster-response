-- ============================================================
-- 03_workflow.sql — additive schema for the connected workflow
-- Run this AFTER 01_schema.sql and 02_rls.sql.
-- Nothing here drops or rewrites existing tables/data.
-- ============================================================

-- ------------------------------------------------------------
-- incidents: add disaster_type (nullable, so existing rows are
-- unaffected) and an 'assigned' status so the incident record
-- can reflect that a rescue team has been dispatched.
-- ------------------------------------------------------------
alter table public.incidents
  add column if not exists disaster_type text;

alter table public.incidents
  drop constraint if exists incidents_status_check;

alter table public.incidents
  add constraint incidents_status_check
  check (status in ('reported','verified','assigned','in_progress','resolved','closed'));

-- ------------------------------------------------------------
-- INCIDENT_UPDATES — append-only history/timeline for an incident.
-- Written by the backend whenever status changes; never edited.
-- ------------------------------------------------------------
create table if not exists public.incident_updates (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  updated_by uuid references auth.users(id) on delete set null,
  previous_status text,
  new_status text not null,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_incident_updates_incident on public.incident_updates(incident_id);
create index if not exists idx_incident_updates_created_at on public.incident_updates(created_at desc);

-- ------------------------------------------------------------
-- RESCUE_ASSIGNMENTS — links a verified incident to a rescue team.
-- ------------------------------------------------------------
create table if not exists public.rescue_assignments (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  rescue_team_id uuid not null references public.rescue_teams(id) on delete cascade,
  assigned_by uuid references auth.users(id),
  status text not null default 'assigned'
    check (status in ('assigned','accepted','en_route','arrived','responding','resolved')),
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rescue_assignments_incident on public.rescue_assignments(incident_id);
create index if not exists idx_rescue_assignments_team on public.rescue_assignments(rescue_team_id);
create index if not exists idx_rescue_assignments_status on public.rescue_assignments(status);

drop trigger if exists trg_rescue_assignments_updated_at on public.rescue_assignments;
create trigger trg_rescue_assignments_updated_at
before update on public.rescue_assignments
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- NOTIFICATIONS — simple in-app notification feed per user.
-- ------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read);

-- ============================================================
-- RLS for the new tables
-- ============================================================
alter table public.incident_updates enable row level security;
alter table public.rescue_assignments enable row level security;
alter table public.notifications enable row level security;

-- incident_updates: readable by the citizen who reported the
-- incident, plus any responder role. Writes only via the backend's
-- service-role client (no client insert policy — mirrors audit_logs).
create policy "incident_updates_select_reporter"
on public.incident_updates for select
using (
  exists (
    select 1 from public.incidents i
    where i.id = incident_id and i.reported_by = auth.uid()
  )
);

create policy "incident_updates_select_responders"
on public.incident_updates for select
using (public.current_user_role() in ('authority','admin','rescuer','volunteer'));

-- rescue_assignments: rescuer sees assignments for teams they lead;
-- authority/admin see everything; writes are backend-only (service
-- role), matching how the rest of the write-heavy workflow tables
-- are handled — the Express layer is the enforcement point for
-- transitions, not direct client writes.
create policy "rescue_assignments_select_authority_admin"
on public.rescue_assignments for select
using (public.current_user_role() in ('authority','admin'));

create policy "rescue_assignments_select_team_lead"
on public.rescue_assignments for select
using (
  exists (
    select 1 from public.rescue_teams t
    where t.id = rescue_team_id and t.lead_user_id = auth.uid()
  )
);

-- notifications: users can only ever see their own.
create policy "notifications_select_own"
on public.notifications for select
using (auth.uid() = user_id);

create policy "notifications_update_own"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
