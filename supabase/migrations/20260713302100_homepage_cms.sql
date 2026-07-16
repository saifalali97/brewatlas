-- Homepage CMS tables + publish flags for lookup entities.
-- Enables editing homepage content from /admin without code deploys.

alter table public.devices
  add column if not exists published boolean not null default true;

alter table public.origins
  add column if not exists published boolean not null default true;

alter table public.roasters
  add column if not exists published boolean not null default true;

comment on column public.devices.published is 'When false, hidden from public device listings.';
comment on column public.origins.published is 'When false, hidden from public origin listings.';
comment on column public.roasters.published is 'When false, hidden from public roaster listings.';

-- Hero banners (homepage hero carousel / primary hero)
create table if not exists public.homepage_hero_banners (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  eyebrow text,
  title text not null,
  subtitle text,
  image_url text,
  media_asset_id uuid references public.media_assets (id) on delete set null,
  cta_label text,
  cta_href text,
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_hero_banners_locale_published_idx
  on public.homepage_hero_banners (locale, published, position);

comment on table public.homepage_hero_banners is
  'Admin-managed hero banners for the public homepage.';

-- Generic homepage sections (brew methods, origins showcase, roasters, testimonials, pricing, faqs, etc.)
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  section_key text not null,
  title text,
  content jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint homepage_sections_locale_key unique (locale, section_key)
);

create index if not exists homepage_sections_locale_published_idx
  on public.homepage_sections (locale, published, position);

comment on table public.homepage_sections is
  'JSON content blocks for homepage sections, keyed by section_key per locale.';

-- Featured recipe slots on the homepage (linked recipe or manual card)
create table if not exists public.homepage_featured_recipes (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  recipe_id uuid references public.recipes (id) on delete set null,
  display_name text,
  display_image_url text,
  media_asset_id uuid references public.media_assets (id) on delete set null,
  display_country text,
  display_origin text,
  display_brew_method text,
  display_notes text,
  published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_featured_recipes_locale_published_idx
  on public.homepage_featured_recipes (locale, published, position);

comment on table public.homepage_featured_recipes is
  'Ordered featured recipe cards on the homepage; may link to a recipe or use manual fields.';

alter table public.homepage_hero_banners enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.homepage_featured_recipes enable row level security;

create policy "Published hero banners are public"
  on public.homepage_hero_banners for select
  using (published = true);

create policy "Admins manage hero banners"
  on public.homepage_hero_banners for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Published homepage sections are public"
  on public.homepage_sections for select
  using (published = true);

create policy "Admins manage homepage sections"
  on public.homepage_sections for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Published featured homepage recipes are public"
  on public.homepage_featured_recipes for select
  using (published = true);

create policy "Admins manage featured homepage recipes"
  on public.homepage_featured_recipes for all
  using (public.is_admin()) with check (public.is_admin());

-- Admins need to read unpublished rows for CMS editing
create policy "Admins read all hero banners"
  on public.homepage_hero_banners for select
  using (public.is_admin());

create policy "Admins read all homepage sections"
  on public.homepage_sections for select
  using (public.is_admin());

create policy "Admins read all featured homepage recipes"
  on public.homepage_featured_recipes for select
  using (public.is_admin());
