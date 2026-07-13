-- roasters: coffee roasters featured on BrewAtlas. Public read, admin-only
-- write.

create table public.roasters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  website text,
  logo_url text,
  created_at timestamptz not null default now(),
  constraint roasters_name_key unique (name)
);

comment on table public.roasters is
  'Coffee roasters featured on BrewAtlas, referenced by recipes.';

create index roasters_country_idx on public.roasters (country);

alter table public.roasters enable row level security;

create policy "Roasters are viewable by everyone"
  on public.roasters
  for select
  using (true);

create policy "Admins can manage roasters"
  on public.roasters
  for all
  using (public.is_admin())
  with check (public.is_admin());
