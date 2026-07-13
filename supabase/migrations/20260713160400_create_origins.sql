-- origins: reference list of coffee-growing origins (country + region).
-- Public read, admin-only write.

create table public.origins (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  region text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint origins_country_region_key unique (country, region)
);

comment on table public.origins is
  'Reference list of coffee-growing origins used by recipes.';

create index origins_country_idx on public.origins (country);

alter table public.origins enable row level security;

create policy "Origins are viewable by everyone"
  on public.origins
  for select
  using (true);

create policy "Admins can manage origins"
  on public.origins
  for all
  using (public.is_admin())
  with check (public.is_admin());
