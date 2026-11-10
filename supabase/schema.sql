-- Run this migration in Supabase SQL Editor.
-- The API uses the server-only Supabase key and reads these tables directly.

create extension if not exists pgcrypto;

create table if not exists public.dashboard_metrics (
  key text primary key,
  label text not null,
  value text not null,
  delta text not null default '',
  trend text not null check (trend in ('up', 'down', 'flat')),
  sort_order integer not null default 0
);

create table if not exists public.revenue_snapshots (
  month date primary key,
  mrr numeric(14, 2) not null default 0,
  churn numeric(6, 2) not null default 0
);

create table if not exists public.acquisition_sources (
  source text primary key,
  signups integer not null default 0 check (signups >= 0)
);

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  arr numeric(14, 2) not null default 0 check (arr >= 0),
  seats integer not null default 0 check (seats >= 0),
  plan text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null check (role in ('Owner', 'Admin', 'Analyst', 'Viewer')),
  status text not null check (status in ('active', 'invited', 'suspended')),
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.workspace_users (id, name, email, role, status, last_active_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'Viewer',
    'active',
    now()
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    last_active_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  actor_name text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.security_settings (
  id integer primary key check (id = 1),
  sso_required boolean not null default false,
  mfa_required boolean not null default false,
  session_timeout_minutes integer not null default 60 check (session_timeout_minutes between 15 and 240),
  api_key_last_rotated timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

insert into public.security_settings (id)
values (1)
on conflict (id) do nothing;

create index if not exists accounts_arr_idx on public.accounts (arr desc);
create index if not exists activity_events_created_at_idx on public.activity_events (created_at desc);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

-- Browser clients should not access analytics tables directly.
-- The authenticated Express API is the access boundary.
alter table public.dashboard_metrics enable row level security;
alter table public.revenue_snapshots enable row level security;
alter table public.acquisition_sources enable row level security;
alter table public.accounts enable row level security;
alter table public.workspace_users enable row level security;
alter table public.activity_events enable row level security;
alter table public.security_settings enable row level security;
alter table public.notifications enable row level security;
