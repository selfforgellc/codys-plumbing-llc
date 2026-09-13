create extension if not exists pgcrypto;

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  address text not null,
  city text not null,
  service_type text not null,
  description text not null,
  is_emergency boolean not null default false,
  preferred_time text not null,
  status text not null default 'New' check (status in ('New','Contacted','Scheduled','In Progress','Completed','Cancelled'))
);

create index if not exists service_requests_created_at_idx on public.service_requests (created_at desc);
create index if not exists service_requests_status_idx on public.service_requests (status);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  endpoint text not null unique,
  subscription jsonb not null
);

alter table public.service_requests enable row level security;
alter table public.push_subscriptions enable row level security;

-- All reads/writes happen through Vercel serverless functions using the Supabase service role.
-- No public client policies are created.
