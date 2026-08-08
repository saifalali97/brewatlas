-- Gulf Directory catalog: countries + cities.
-- Roasters keep legacy text country/city columns and gain optional FKs.

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  flag text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries (id) on delete cascade,
  name text not null,
  slug text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (country_id, slug),
  unique (country_id, name)
);

create index if not exists cities_country_id_idx on public.cities (country_id);

alter table public.roasters
  add column if not exists country_id uuid references public.countries (id),
  add column if not exists city_id uuid references public.cities (id);

create index if not exists roasters_country_id_idx on public.roasters (country_id);
create index if not exists roasters_city_id_idx on public.roasters (city_id);

comment on table public.countries is
  'Gulf Directory country catalog (UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman).';

comment on table public.cities is
  'Gulf Directory city catalog, scoped to a country.';

comment on column public.roasters.country_id is
  'Optional FK to directory countries; legacy text country column remains for compatibility.';

comment on column public.roasters.city_id is
  'Optional FK to directory cities; legacy text city column remains for compatibility.';

drop trigger if exists countries_set_updated_at on public.countries;
create trigger countries_set_updated_at
  before update on public.countries
  for each row
  execute function public.set_updated_at();

drop trigger if exists cities_set_updated_at on public.cities;
create trigger cities_set_updated_at
  before update on public.cities
  for each row
  execute function public.set_updated_at();

alter table public.countries enable row level security;
alter table public.cities enable row level security;

drop policy if exists "Public can read published countries" on public.countries;
create policy "Public can read published countries"
  on public.countries
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins can manage countries" on public.countries;
create policy "Admins can manage countries"
  on public.countries
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Public can read published cities" on public.cities;
create policy "Public can read published cities"
  on public.cities
  for select
  to anon, authenticated
  using (published = true);

drop policy if exists "Admins can manage cities" on public.cities;
create policy "Admins can manage cities"
  on public.cities
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.countries (slug, name, flag, sort_order)
values
  ('uae', 'United Arab Emirates', '🇦🇪', 1),
  ('saudi-arabia', 'Saudi Arabia', '🇸🇦', 2),
  ('kuwait', 'Kuwait', '🇰🇼', 3),
  ('qatar', 'Qatar', '🇶🇦', 4),
  ('bahrain', 'Bahrain', '🇧🇭', 5),
  ('oman', 'Oman', '🇴🇲', 6)
on conflict (slug) do update
set
  name = excluded.name,
  flag = excluded.flag,
  sort_order = excluded.sort_order,
  published = true,
  updated_at = now();

-- Backfill country_id from legacy text country.
update public.roasters r
set country_id = c.id
from public.countries c
where r.country_id is null
  and r.country is not null
  and r.country = c.name;

-- Seed cities from distinct roaster city names within each country.
insert into public.cities (country_id, name, slug)
select
  c.id,
  city_name,
  lower(regexp_replace(trim(city_name), '[^a-zA-Z0-9]+', '-', 'g'))
from public.countries c
inner join lateral (
  select distinct nullif(trim(r.city), '') as city_name
  from public.roasters r
  where r.country_id = c.id
    and nullif(trim(r.city), '') is not null
) cities on true
on conflict (country_id, slug) do nothing;

-- Backfill city_id from legacy text city + country_id.
update public.roasters r
set city_id = ci.id
from public.cities ci
where r.city_id is null
  and r.country_id is not null
  and r.city is not null
  and ci.country_id = r.country_id
  and lower(trim(r.city)) = lower(ci.name);
