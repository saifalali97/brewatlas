-- culture_topics: the individual articles within a culture_sections entry
-- (e.g. "The Dallah", "Karak: The UAE's Favorite Tea"). Same admin-managed,
-- locale-ready shape as culture_sections -- see that migration's comments
-- for the multilingual rationale.

create table public.culture_topics (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.culture_sections (id) on delete cascade,
  slug text not null,
  locale text not null default 'en',
  title text not null,
  excerpt text not null,
  body text not null,
  hero_image_url text,
  seo_title text,
  seo_description text,
  position integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint culture_topics_section_slug_locale_key unique (section_id, slug, locale)
);

comment on table public.culture_topics is
  'Individual articles belonging to a culture_sections entry, e.g. "The Dallah" under "Arabic Coffee".';
comment on column public.culture_topics.excerpt is
  'Short summary shown on section listing cards.';
comment on column public.culture_topics.body is
  'Full article body, plain text with blank-line paragraph breaks (rendered whitespace-pre-line, matching recipes.instructions).';
comment on column public.culture_topics.locale is
  'BCP-47-style language tag (default "en"); a translation is a second row sharing section_id + slug with a different locale.';

create index culture_topics_section_id_idx on public.culture_topics (section_id);
create index culture_topics_slug_idx on public.culture_topics (slug);
create index culture_topics_locale_idx on public.culture_topics (locale);
create index culture_topics_position_idx on public.culture_topics (position);

create trigger culture_topics_set_updated_at
  before update on public.culture_topics
  for each row
  execute function public.set_updated_at();

alter table public.culture_topics enable row level security;

create policy "Published culture topics are viewable by everyone"
  on public.culture_topics for select
  using (published = true);

create policy "Admins can manage all culture topics"
  on public.culture_topics for all
  using (public.is_admin())
  with check (public.is_admin());
