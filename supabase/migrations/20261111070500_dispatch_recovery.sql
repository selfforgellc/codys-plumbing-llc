create table public.dispatch_recovery (
  singleton boolean primary key default true check (singleton),
  code_hash text not null,
  expires_at timestamptz not null
);

alter table public.dispatch_recovery enable row level security;
revoke all on public.dispatch_recovery from public, anon, authenticated;
grant select, insert, update, delete on public.dispatch_recovery to service_role;

create function public.reset_dispatch_password(recovery_hash text, replacement_hash text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.dispatch_recovery
  where singleton and code_hash = recovery_hash and expires_at > clock_timestamp();
  if not found then
    return false;
  end if;

  insert into public.dispatch_password (singleton, password_hash)
  values (true, replacement_hash)
  on conflict (singleton) do update set password_hash = excluded.password_hash;
  return true;
end;
$$;

revoke all on function public.reset_dispatch_password(text, text) from public, anon, authenticated;
grant execute on function public.reset_dispatch_password(text, text) to service_role;
