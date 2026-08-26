-- ============================================================
-- Unified Disaster Situation Awareness & Emergency Response System
-- 01_schema.sql — core tables, enums, triggers
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- ------------------------------------------------------------
-- ENUM: valid roles. Using an enum (not free text) means the
-- database itself rejects "role=superadmin" typos or injected
-- garbage roles — this is enforced independent of any app code.
-- ------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum (
      'citizen',
      'rescuer',
      'authority',
      'hospital',
      'volunteer',
      'admin'
    );
  end if;
end$$;

-- ------------------------------------------------------------
-- PROFILES
-- 1:1 extension of auth.users. auth.users (managed entirely by
-- Supabase Auth) holds the password hash, email confirmation
-- state, etc. — we never duplicate any of that here.
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  role public.user_role not null default 'citizen',
  organization text,
  is_active boolean not null default true,
  -- privileged roles (authority/hospital/admin) are not usable
  -- as that role until an admin approves the upgrade request
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_is_active on public.profiles(is_active);
create unique index if not exists idx_profiles_email on public.profiles(email);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- Auto-provision a profile row whenever Supabase Auth creates a
-- user. This runs SECURITY DEFINER so it can write to profiles
-- regardless of the calling user's RLS grants. Role is read from
-- signup metadata but privileged roles are downgraded to
-- 'citizen' here — see 02_rls.sql prevent_role_self_escalation
-- and role_upgrade_requests for how privileged roles are granted.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  begin
    requested_role := coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'citizen');
  exception when others then
    requested_role := 'citizen';
  end;

  -- privileged roles can never be self-granted at signup time
  if requested_role in ('authority', 'hospital', 'admin') then
    requested_role := 'citizen';
  end if;

  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.raw_user_meta_data->>'phone',
    requested_role
  );

  -- if they actually wanted a privileged role, log the intent as
  -- a pending upgrade request instead of granting it
  if (new.raw_user_meta_data->>'role') in ('authority', 'hospital', 'admin') then
    insert into public.role_upgrade_requests (user_id, requested_role, organization, justification)
    values (
      new.id,
      (new.raw_user_meta_data->>'role')::public.user_role,
      new.raw_user_meta_data->>'organization',
      'Requested at signup'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- ROLE UPGRADE REQUESTS
-- The only path from citizen -> authority/hospital/admin.
-- ------------------------------------------------------------
create table if not exists public.role_upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requested_role public.user_role not null,
  organization text,
  justification text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_role_requests_status on public.role_upgrade_requests(status);
create index if not exists idx_role_requests_user on public.role_upgrade_requests(user_id);

-- ------------------------------------------------------------
-- AUDIT LOGS
-- Written only by the backend using the service-role key
-- (which bypasses RLS) — never by client-side code.
-- ------------------------------------------------------------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in (
    'login_success', 'login_failure', 'logout',
    'password_reset_requested', 'password_reset_completed',
    'role_change_requested', 'role_change_approved', 'role_change_rejected',
    'account_activated', 'account_deactivated',
    'privileged_action', 'unauthorized_attempt'
  )),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
create index if not exists idx_audit_logs_event_type on public.audit_logs(event_type);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

-- ------------------------------------------------------------
-- PLACEHOLDER DOMAIN TABLES
-- Minimal shape so the /api/incidents etc. routes have something
-- real to talk to. Full schema (severity workflows, geo columns,
-- assignment logic) belongs to the incident-management module.
-- ------------------------------------------------------------
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid not null references auth.users(id),
  title text not null,
  description text,
  severity text not null default 'unknown' check (severity in ('low','medium','high','critical','unknown')),
  status text not null default 'reported' check (status in ('reported','verified','in_progress','resolved','closed')),
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_incidents_updated_at on public.incidents;
create trigger trg_incidents_updated_at
before update on public.incidents
for each row execute function public.set_updated_at();

create table if not exists public.rescue_teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  lead_user_id uuid references auth.users(id),
  status text not null default 'available' check (status in ('available','deployed','offline')),
  created_at timestamptz not null default now()
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  managed_by uuid references auth.users(id),
  name text not null,
  total_beds int not null default 0,
  available_beds int not null default 0,
  icu_available int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.shelters (
  id uuid primary key default gen_random_uuid(),
  managed_by uuid references auth.users(id),
  name text not null,
  capacity int not null default 0,
  current_occupancy int not null default 0,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);
