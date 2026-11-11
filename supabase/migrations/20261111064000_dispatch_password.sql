create table public.dispatch_password (
  singleton boolean primary key default true check (singleton),
  password_hash text not null
);

alter table public.dispatch_password enable row level security;
revoke all on public.dispatch_password from public, anon, authenticated;
grant select, insert, update on public.dispatch_password to service_role;

-- Retire the unused setup codes from the earlier Dispatch rollout.
update dispatch_private.accounts
set setup_hash = null, setup_expires_at = null
where username in ('anthony', 'cody') and password_hash is null;
