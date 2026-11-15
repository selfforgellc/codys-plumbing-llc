create table public.website_visits (
  id uuid primary key,
  visited_at timestamptz not null default now()
);

create index website_visits_visited_at_idx on public.website_visits (visited_at);

alter table public.website_visits enable row level security;
revoke all on public.website_visits from public, anon, authenticated;
grant select, insert on public.website_visits to service_role;
