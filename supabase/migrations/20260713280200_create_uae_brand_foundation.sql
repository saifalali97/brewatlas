-- UAE brand identity foundation:
--   1. Extends `roasters` with UAE-specific brand columns (slug, emirate,
--      city, description, featured, is_uae) so a subset of roasters can be
--      surfaced as "UAE Featured Roasters" without a parallel table.
--   2. `uae_heritage_highlights`: short "fact card" content for the Coffee
--      Heritage brand section (history, majlis, hospitality, etiquette,
--      dallah, finjan, serving customs, UNESCO references), distinct from
--      the long-form `culture_topics` articles it can optionally deep-link
--      to via related_section_slug/related_topic_slug.
--   3. `uae_coffee_map_locations`: database + backend foundation for a
--      future interactive map of UAE coffee shops/roasters. No external
--      map integration yet, per requirement.
--
-- Public read (published rows only where applicable), admin-only write,
-- matching the existing `roasters` / `culture_*` RLS conventions.

alter table public.roasters
  add column slug text,
  add column emirate text,
  add column city text,
  add column description text,
  add column featured boolean not null default false,
  add column is_uae boolean not null default false;

create unique index roasters_slug_key on public.roasters (slug);

comment on column public.roasters.slug is
  'URL-safe identifier for roaster detail/brand pages. Nullable -- only populated for roasters that need a dedicated page (e.g. UAE-featured roasters).';
comment on column public.roasters.emirate is
  'UAE emirate the roaster is based in (e.g. Dubai, Abu Dhabi). Null for non-UAE roasters.';
comment on column public.roasters.is_uae is
  'True for roasters headquartered/roasting in the UAE, surfaced in the "UAE Featured Roasters" brand section.';
comment on column public.roasters.logo_url is
  'Generic placeholder artwork only (e.g. an initial-based mark) -- never a real trademarked logo.';

-- uae_heritage_highlights --------------------------------------------------

create table public.uae_heritage_highlights (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (
    category in ('history', 'majlis', 'hospitality', 'etiquette', 'dallah', 'finjan', 'serving', 'unesco')
  ),
  title text not null,
  summary text not null,
  icon_key text,
  related_section_slug text,
  related_topic_slug text,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.uae_heritage_highlights is
  'Short "fact card" content for the UAE Coffee Heritage brand section. Optionally deep-links into a full culture_topics article via related_section_slug/related_topic_slug rather than duplicating its body text.';

create index uae_heritage_highlights_position_idx on public.uae_heritage_highlights (position);

alter table public.uae_heritage_highlights enable row level security;

create policy "Heritage highlights are viewable by everyone"
  on public.uae_heritage_highlights
  for select
  using (published = true or public.is_admin());

create policy "Admins can manage heritage highlights"
  on public.uae_heritage_highlights
  for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger uae_heritage_highlights_set_updated_at
  before update on public.uae_heritage_highlights
  for each row
  execute function public.set_updated_at();

-- uae_coffee_map_locations --------------------------------------------------

create table public.uae_coffee_map_locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location_type text not null check (
    location_type in ('roaster', 'cafe', 'majlis', 'roastery_cafe')
  ),
  emirate text not null,
  city text,
  address text,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  description text,
  website text,
  roaster_id uuid references public.roasters (id) on delete set null,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.uae_coffee_map_locations is
  'Database + backend foundation for a future interactive UAE coffee map. No map UI/external map provider wired in yet -- rows are consumed only via lib/data/uae-brand.ts.';

create index uae_coffee_map_locations_emirate_idx on public.uae_coffee_map_locations (emirate);
create index uae_coffee_map_locations_roaster_id_idx on public.uae_coffee_map_locations (roaster_id);

alter table public.uae_coffee_map_locations enable row level security;

create policy "Coffee map locations are viewable by everyone"
  on public.uae_coffee_map_locations
  for select
  using (published = true or public.is_admin());

create policy "Admins can manage coffee map locations"
  on public.uae_coffee_map_locations
  for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger uae_coffee_map_locations_set_updated_at
  before update on public.uae_coffee_map_locations
  for each row
  execute function public.set_updated_at();
