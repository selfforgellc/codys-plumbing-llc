# Dispatch accounts

The named accounts are `cody` and `anthony`. Each person sets their own password and saves three one-time recovery codes during setup. Remembered sessions expire after 30 days. Other sessions use a browser-session cookie and expire on the server after 12 hours.

## Rollout

1. Apply `supabase/migrations/20261111050000_dispatch_accounts.sql` to Cody's Supabase project. Deploy the application with `DISPATCH_ACCOUNTS_MODE` unset to keep the existing sign-in available.
2. In the Supabase SQL Editor, run the statement below to issue a private setup code for each account. Share each setup code privately with its intended account holder. A setup code is valid for 48 hours. Running the statement again replaces setup codes only for accounts that have yet to be activated.
3. Set `DISPATCH_ACCOUNTS_MODE=setup` in Vercel and redeploy. Each person opens Dispatch, selects **Set up account**, enters their username and setup code, chooses a password, and saves all three recovery codes. The shared password remains available by leaving the username blank during this transition.
4. Verify both named accounts can sign in and open the dashboard. Exercise recovery with a disposable test account in a separate database before rollout. Then set `DISPATCH_ACCOUNTS_MODE=enabled` and redeploy to retire the shared password. Remove the old `ADMIN_PASSWORD` setting after confirming the rollout.

```sql
with issued as materialized (
  select username, rtrim(translate(encode(extensions.gen_random_bytes(16), 'base64'), '+/', '-_'), '=') as code
  from (values ('cody'), ('anthony')) as users(username)
), saved as (
  insert into dispatch_private.accounts (username, setup_hash, setup_expires_at)
    select username, encode(extensions.digest(code, 'sha256'), 'hex'), now() + interval '48 hours'
    from issued
  on conflict (username) do update
    set setup_hash = excluded.setup_hash, setup_expires_at = excluded.setup_expires_at,
        recovery_attempts = 0, recovery_window = now()
    where dispatch_private.accounts.password_hash is null
  returning username
)
select issued.username, issued.code as setup_code from issued join saved using (username);
```

Changing or recovering a password signs out that account on every device. A used recovery code is removed. If all three codes are lost or used, contact the person managing Dispatch access for account re-enrollment.

