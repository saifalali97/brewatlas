-- Additional reference lookup tables needed by the expanded recipe model:
-- grinders, filter types, water profiles ("water recipes"), and flavor
-- tags. All follow the same public-read / admin-write pattern as
-- brewing_methods/devices/origins/roasters.

create table public.grinders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  manufacturer text,
  created_at timestamptz not null default now(),
  constraint grinders_slug_key unique (slug)
);

comment on table public.grinders is 'Reference list of coffee grinders used by recipes.';
create index grinders_manufacturer_idx on public.grinders (manufacturer);

alter table public.grinders enable row level security;

create policy "Grinders are viewable by everyone"
  on public.grinders for select using (true);

create policy "Admins can manage grinders"
  on public.grinders for all using (public.is_admin()) with check (public.is_admin());

create table public.filter_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint filter_types_slug_key unique (slug)
);

comment on table public.filter_types is 'Reference list of brew filter types (paper, metal, cloth, etc.).';

alter table public.filter_types enable row level security;

create policy "Filter types are viewable by everyone"
  on public.filter_types for select using (true);

create policy "Admins can manage filter types"
  on public.filter_types for all using (public.is_admin()) with check (public.is_admin());

create table public.water_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint water_profiles_slug_key unique (slug)
);

comment on table public.water_profiles is 'Reference list of brewing water recipes/profiles (e.g. Third Wave Water).';

alter table public.water_profiles enable row level security;

create policy "Water profiles are viewable by everyone"
  on public.water_profiles for select using (true);

create policy "Admins can manage water profiles"
  on public.water_profiles for all using (public.is_admin()) with check (public.is_admin());

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint tags_slug_key unique (slug)
);

comment on table public.tags is 'Flavor/style tags that can be attached to recipes (fruity, floral, competition, etc.).';

alter table public.tags enable row level security;

create policy "Tags are viewable by everyone"
  on public.tags for select using (true);

create policy "Admins can manage tags"
  on public.tags for all using (public.is_admin()) with check (public.is_admin());
