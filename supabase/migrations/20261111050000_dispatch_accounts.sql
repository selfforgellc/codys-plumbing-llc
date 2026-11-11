create schema if not exists dispatch_private;
revoke all on schema dispatch_private from public, anon, authenticated;

create table dispatch_private.accounts (
  username text primary key check (username in ('cody', 'anthony')),
  password_hash text,
  setup_hash text,
  setup_expires_at timestamptz,
  recovery_hashes text[] not null default '{}',
  login_attempts integer not null default 0,
  login_window timestamptz not null default now(),
  recovery_attempts integer not null default 0,
  recovery_window timestamptz not null default now()
);

create table dispatch_private.sessions (
  token_hash text primary key,
  username text not null references dispatch_private.accounts on delete cascade,
  expires_at timestamptz not null
);
create index dispatch_sessions_username on dispatch_private.sessions (username);

create function public.dispatch_account_action(
  action text, account_name text, credential text, new_password text,
  session_hash text, remember_device boolean, new_recovery_hashes text[]
) returns text
language plpgsql security definer set search_path = ''
as $$
declare
  account dispatch_private.accounts%rowtype;
  session_username text;
  is_recovery boolean;
  current_time_utc timestamptz := statement_timestamp();
begin
  if action in ('session', 'logout', 'change') then
    if action = 'logout' then
      delete from dispatch_private.sessions where token_hash = session_hash;
      return 'ok';
    end if;
    select s.username into session_username from dispatch_private.sessions s
      where s.token_hash = session_hash and s.expires_at > current_time_utc;
    if not found then return 'invalid'; end if;
    if action = 'session' then return session_username; end if;
    account_name := session_username;
  end if;

  if action not in ('login', 'setup', 'recover', 'change') then return 'invalid'; end if;
  select * into account from dispatch_private.accounts a where a.username = account_name for update;
  if not found then return 'invalid'; end if;

  is_recovery := action in ('setup', 'recover');
  if is_recovery then
    if account.recovery_window <= current_time_utc - interval '15 minutes' then
      account.recovery_attempts := 0;
      account.recovery_window := current_time_utc;
    end if;
    if account.recovery_attempts >= 8 then return 'limited'; end if;
    update dispatch_private.accounts set recovery_attempts = account.recovery_attempts + 1,
      recovery_window = account.recovery_window where username = account_name;
  else
    if account.login_window <= current_time_utc - interval '15 minutes' then
      account.login_attempts := 0;
      account.login_window := current_time_utc;
    end if;
    if account.login_attempts >= 8 then return 'limited'; end if;
    update dispatch_private.accounts set login_attempts = account.login_attempts + 1,
      login_window = account.login_window where username = account_name;
  end if;

  if action = 'setup' then
    if account.password_hash is not null or account.setup_hash is null or
      account.setup_expires_at is null or account.setup_expires_at <= current_time_utc or
      credential is distinct from account.setup_hash or
      coalesce(cardinality(new_recovery_hashes), 0) <> 3 then return 'invalid'; end if;
  elsif action = 'recover' then
    if account.password_hash is null or
      (credential = any(account.recovery_hashes)) is not true then return 'invalid'; end if;
  else
    if account.password_hash is null or credential is null or octet_length(credential) > 72 or
      extensions.crypt(credential, account.password_hash) <> account.password_hash then return 'invalid'; end if;
  end if;

  if action = 'change' and not exists (
    select 1 from dispatch_private.sessions s where s.token_hash = session_hash
      and s.username = account_name and s.expires_at > current_time_utc
  ) then return 'invalid'; end if;

  if action = 'login' then
    update dispatch_private.accounts set login_attempts = 0 where username = account_name;
    delete from dispatch_private.sessions where username = account_name and expires_at <= current_time_utc;
    insert into dispatch_private.sessions (token_hash, username, expires_at)
      values (session_hash, account_name, current_time_utc +
        case when remember_device then interval '30 days' else interval '12 hours' end);
    return 'ok';
  end if;

  if new_password is null or octet_length(new_password) not between 12 and 72 then return 'invalid'; end if;
  update dispatch_private.accounts set
    password_hash = extensions.crypt(new_password, extensions.gen_salt('bf', 12)),
    setup_hash = null,
    setup_expires_at = null,
    recovery_hashes = case action
      when 'setup' then new_recovery_hashes
      when 'recover' then array_remove(account.recovery_hashes, credential)
      else account.recovery_hashes
    end,
    login_attempts = 0,
    recovery_attempts = 0
  where username = account_name;
  delete from dispatch_private.sessions where username = account_name;
  return 'ok';
end;
$$;

revoke all on function public.dispatch_account_action(text, text, text, text, text, boolean, text[])
  from public, anon, authenticated;
grant execute on function public.dispatch_account_action(text, text, text, text, text, boolean, text[])
  to service_role;

