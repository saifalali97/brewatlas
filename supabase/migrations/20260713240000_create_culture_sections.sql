-- culture_sections: top-level editorial "culture" sections (e.g. "UAE Coffee
-- Culture", "Arabic Coffee", "Tea"). This is reusable, admin-managed
-- editorial content -- structurally similar to the lookup tables
-- (brewing_methods, origins, roasters) rather than user-generated content,
-- so there's no `created_by`/ownership; visibility is just `published`.
--
-- `locale` (default 'en') plus the `(slug, locale)` unique constraint is the
-- groundwork for future multilingual content: a translated section is just
-- another row with the same `slug` and a different `locale`, so URLs and
-- foreign keys never need to change when a translation is added.

create table public.culture_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  locale text not null default 'en',
  eyebrow text,
  name text not null,
  description text not null,
  hero_image_url text,
  seo_title text,
  seo_description text,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint culture_sections_slug_locale_key unique (slug, locale)
);

comment on table public.culture_sections is
  'Top-level editorial "culture" sections (e.g. UAE Coffee Culture, Arabic Coffee, Tea). Admin-managed, grouping culture_topics.';
comment on column public.culture_sections.slug is
  'URL segment, stable across locales -- e.g. "arabic-coffee" for /culture/arabic-coffee.';
comment on column public.culture_sections.locale is
  'BCP-47-style language tag (default "en"); a translation is a second row sharing the same slug with a different locale.';
comment on column public.culture_sections.position is
  'Manual display order among sibling sections in the same locale, ascending.';

create index culture_sections_slug_idx on public.culture_sections (slug);
create index culture_sections_locale_idx on public.culture_sections (locale);
create index culture_sections_position_idx on public.culture_sections (position);

create trigger culture_sections_set_updated_at
  before update on public.culture_sections
  for each row
  execute function public.set_updated_at();

alter table public.culture_sections enable row level security;

-- Editorial content: anyone (including anonymous visitors) can read
-- published sections; only admins can create/edit/unpublish/delete.
create policy "Published culture sections are viewable by everyone"
  on public.culture_sections for select
  using (published = true);

create policy "Admins can manage all culture sections"
  on public.culture_sections for all
  using (public.is_admin())
  with check (public.is_admin());
