-- Database-backed content translations for the i18n system (see
-- lib/i18n/*, lib/data/translations.ts, types/i18n.ts).
--
-- Design: each translatable table keeps exactly one canonical row per
-- entity (so every existing foreign key -- favorites, reviews, brew
-- logs, recipe_feature_vectors, xbloom_profiles, etc. -- never needs to
-- change), and gains a companion `*_translations` table holding only
-- the human-language fields for a given locale. This mirrors the
-- `culture_sections`/`culture_topics` "row per locale" approach in
-- spirit, but a companion table is required here (rather than adding a
-- `locale` column directly to e.g. `recipes`) because those tables are
-- the target of many foreign keys and must keep a single stable id per
-- real-world entity.
--
-- `is_machine_translated` groups with "Future AI Translation"
-- (requirement 9 / lib/i18n/translation-adapter.ts): a row written by a
-- human translator is `false`; a row filled in later by an AI adapter
-- is `true`, so the UI can label it and an editor can find/replace it.

-- ---------------------------------------------------------------------------
-- recipe_translations
-- ---------------------------------------------------------------------------

create table public.recipe_translations (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  locale text not null,
  title text,
  description text,
  brew_notes text,
  tasting_notes text,
  tips text,
  warnings text,
  steps text,
  ai_summary text,
  is_machine_translated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (recipe_id, locale)
);

comment on table public.recipe_translations is
  'Per-locale translated copy for a recipe (title, description, brew notes, tasting notes, tips, warnings, steps, AI summary). recipes.* stays the single canonical row; only display text is duplicated per locale.';
comment on column public.recipe_translations.steps is
  'Translated version of recipes.instructions.';
comment on column public.recipe_translations.is_machine_translated is
  'true when this row was filled in by a TranslationAdapter (see lib/i18n/translation-adapter.ts) rather than a human editor.';

create index recipe_translations_locale_idx on public.recipe_translations (locale);

create trigger recipe_translations_set_updated_at
  before update on public.recipe_translations
  for each row
  execute function public.set_updated_at();

alter table public.recipe_translations enable row level security;

create policy "Recipe translations are viewable when the recipe is"
  on public.recipe_translations for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_translations.recipe_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage translations of their own recipes"
  on public.recipe_translations for all
  using (
    exists (select 1 from public.recipes r where r.id = recipe_translations.recipe_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = recipe_translations.recipe_id and r.author_id = auth.uid())
  );

create policy "Admins can manage all recipe translations"
  on public.recipe_translations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Lookup-entity translations: coffees, devices, origins, brewing_methods.
-- Same generic (name, description) shape -- these tables only ever show a
-- short display name plus an optional description/blurb.
-- ---------------------------------------------------------------------------

create table public.coffee_translations (
  entity_id uuid not null references public.coffees (id) on delete cascade,
  locale text not null,
  name text,
  description text,
  is_machine_translated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_id, locale)
);

create table public.device_translations (
  entity_id uuid not null references public.devices (id) on delete cascade,
  locale text not null,
  name text,
  description text,
  is_machine_translated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_id, locale)
);

create table public.origin_translations (
  entity_id uuid not null references public.origins (id) on delete cascade,
  locale text not null,
  name text,
  description text,
  is_machine_translated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_id, locale)
);

create table public.brewing_method_translations (
  entity_id uuid not null references public.brewing_methods (id) on delete cascade,
  locale text not null,
  name text,
  description text,
  is_machine_translated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (entity_id, locale)
);

comment on table public.coffee_translations is
  'Per-locale translated display name/description for public.coffees.';
comment on table public.device_translations is
  'Per-locale translated display name/description for public.devices.';
comment on table public.origin_translations is
  'Per-locale translated display name (e.g. localized "Country, Region") and description for public.origins.';
comment on table public.brewing_method_translations is
  'Per-locale translated display name/description for public.brewing_methods.';

create index coffee_translations_locale_idx on public.coffee_translations (locale);
create index device_translations_locale_idx on public.device_translations (locale);
create index origin_translations_locale_idx on public.origin_translations (locale);
create index brewing_method_translations_locale_idx on public.brewing_method_translations (locale);

create trigger coffee_translations_set_updated_at
  before update on public.coffee_translations
  for each row execute function public.set_updated_at();
create trigger device_translations_set_updated_at
  before update on public.device_translations
  for each row execute function public.set_updated_at();
create trigger origin_translations_set_updated_at
  before update on public.origin_translations
  for each row execute function public.set_updated_at();
create trigger brewing_method_translations_set_updated_at
  before update on public.brewing_method_translations
  for each row execute function public.set_updated_at();

alter table public.coffee_translations enable row level security;
alter table public.device_translations enable row level security;
alter table public.origin_translations enable row level security;
alter table public.brewing_method_translations enable row level security;

-- Coffees: base table is readable by everyone and writable by whoever
-- added the coffee (plus admins) -- translations follow the same shape.
create policy "Coffee translations are viewable by everyone"
  on public.coffee_translations for select using (true);

create policy "Coffee creators can manage their coffee's translations"
  on public.coffee_translations for all
  using (exists (select 1 from public.coffees c where c.id = coffee_translations.entity_id and c.created_by = auth.uid()))
  with check (exists (select 1 from public.coffees c where c.id = coffee_translations.entity_id and c.created_by = auth.uid()));

create policy "Admins can manage all coffee translations"
  on public.coffee_translations for all
  using (public.is_admin())
  with check (public.is_admin());

-- Devices, origins, brewing methods: base tables are readable by everyone
-- and writable by admins only -- translations follow the same shape.
create policy "Device translations are viewable by everyone"
  on public.device_translations for select using (true);
create policy "Admins can manage all device translations"
  on public.device_translations for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Origin translations are viewable by everyone"
  on public.origin_translations for select using (true);
create policy "Admins can manage all origin translations"
  on public.origin_translations for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Brewing method translations are viewable by everyone"
  on public.brewing_method_translations for select using (true);
create policy "Admins can manage all brewing method translations"
  on public.brewing_method_translations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- ai_content_translations: generic translation store for AI-generated
-- content that has no dedicated table of its own (recommendation
-- "reasons", discovery summaries, future AI-written recipe/tasting
-- summaries, ...). Keyed by an arbitrary (content_type, content_id) pair
-- so any future AI feature can start storing translations without a
-- new migration.
-- ---------------------------------------------------------------------------

create table public.ai_content_translations (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id text not null,
  locale text not null,
  text text not null,
  source_hash text,
  is_machine_translated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_content_translations_unique unique (content_type, content_id, locale)
);

comment on table public.ai_content_translations is
  'Generic per-locale translation store for AI-generated text that has no dedicated table (recommendation reasons, discovery summaries, future AI-written summaries). (content_type, content_id) identifies the source content generically, e.g. content_type = ''ai_user_profile'', content_id = the user id.';
comment on column public.ai_content_translations.source_hash is
  'Optional hash of the untranslated source text, so a translation can be flagged stale when the source changes.';

create index ai_content_translations_lookup_idx on public.ai_content_translations (content_type, content_id);
create index ai_content_translations_locale_idx on public.ai_content_translations (locale);

create trigger ai_content_translations_set_updated_at
  before update on public.ai_content_translations
  for each row
  execute function public.set_updated_at();

alter table public.ai_content_translations enable row level security;

-- Translated AI output is exposed alongside content that's already
-- either public (recipe AI summaries) or scoped to the requesting user
-- (recommendation reasons) at the application layer, so read access
-- mirrors the rest of the AI foundation: anyone can read.
create policy "AI content translations are viewable by everyone"
  on public.ai_content_translations for select using (true);

-- A signed-in user may manage translations of their own AI content
-- (e.g. their AI taste profile summary) -- content_id is the user's id
-- for that content_type.
create policy "Users can manage translations of their own AI content"
  on public.ai_content_translations for all
  using (content_type = 'ai_user_profile' and content_id = auth.uid()::text)
  with check (content_type = 'ai_user_profile' and content_id = auth.uid()::text);

create policy "Admins can manage all AI content translations"
  on public.ai_content_translations for all
  using (public.is_admin())
  with check (public.is_admin());
