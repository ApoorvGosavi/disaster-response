-- ============================================================
-- 04_volunteer_resources.sql — volunteer tasks + resource requests
-- Run this AFTER 01, 02, 03. Additive only — nothing dropped.
-- ============================================================

-- ------------------------------------------------------------
-- VOLUNTEER_TASKS
-- Created by authority/admin, browsed and accepted by volunteers.
-- ------------------------------------------------------------
create table if not exists public.volunteer_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  incident_id uuid references public.incidents(id) on delete set null,
  status text not null default 'open'
    check (status in ('open','assigned','in_progress','completed','cancelled')),
  created_by uuid references auth.users(id),
  assigned_to uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_volunteer_tasks_status on public.volunteer_tasks(status);
create index if not exists idx_volunteer_tasks_assigned_to on public.volunteer_tasks(assigned_to);

drop trigger if exists trg_volunteer_tasks_updated_at on public.volunteer_tasks;
create trigger trg_volunteer_tasks_updated_at
before update on public.volunteer_tasks
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- RESOURCE_REQUESTS
-- Raised by hospital/authority users, reviewed by authority/admin.
-- ------------------------------------------------------------
create table if not exists public.resource_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references auth.users(id),
  incident_id uuid references public.incidents(id) on delete set null,
  resource_type text not null,
  quantity int not null default 1 check (quantity > 0),
  notes text,
  status text not null default 'pending'
    check (status in ('pending','fulfilled','rejected')),
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_resource_requests_status on public.resource_requests(status);
create index if not exists idx_resource_requests_requested_by on public.resource_requests(requested_by);

drop trigger if exists trg_resource_requests_updated_at on public.resource_requests;
create trigger trg_resource_requests_updated_at
before update on public.resource_requests
for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.volunteer_tasks enable row level security;
alter table public.resource_requests enable row level security;

-- volunteer_tasks: any authenticated user can browse open/assigned
-- tasks (volunteers need to see what's available); writes are
-- backend-only (service role) — the Express layer enforces who can
-- create tasks and who can accept them.
create policy "volunteer_tasks_select_authenticated"
on public.volunteer_tasks for select
using (auth.uid() is not null);

-- resource_requests: the requester sees their own; authority/admin
-- see all. Writes are backend-only.
create policy "resource_requests_select_own"
on public.resource_requests for select
using (auth.uid() = requested_by);

create policy "resource_requests_select_authority_admin"
on public.resource_requests for select
using (public.current_user_role() in ('authority','admin'));
