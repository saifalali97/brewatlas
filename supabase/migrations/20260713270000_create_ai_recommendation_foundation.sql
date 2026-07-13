-- BrewAtlas AI: production database foundation for the AI Recommendation
-- Engine, Taste Similarity Engine, Smart Recipe Discovery, and the
-- evolving "AI User Profile".
--
-- Two tables, mirroring the `recipe_insights` precedent (Recipe
-- Intelligence Engine): everything here is *derived*/*calculated*, never
-- entered directly by a user, and can be fully recalculated at any time
-- (see `engine_version`). Nothing here touches `recipes` or `profiles`.
--
-- Both tables store the same 15-dimension normalized (0-1) sensory vector
-- shape -- acidity, sweetness, body, bitterness, floral, fruity,
-- chocolate, nutty, spice, fermented, clarity, roast, brew_ratio,
-- extraction, difficulty -- as individual numeric columns (indexable,
-- filterable) *and* as an ordered `vector` jsonb array in that exact
-- dimension order, so the same array can be handed directly to a future
-- embeddings/ANN index without re-deriving it from the individual
-- columns. See `lib/ai/feature-vectors.ts` for the canonical dimension
-- order (`SENSORY_VECTOR_DIMENSIONS`).

create table public.recipe_feature_vectors (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  engine_version text not null default '1.0',

  acidity numeric(4, 3) not null check (acidity between 0 and 1),
  sweetness numeric(4, 3) not null check (sweetness between 0 and 1),
  body numeric(4, 3) not null check (body between 0 and 1),
  bitterness numeric(4, 3) not null check (bitterness between 0 and 1),
  floral numeric(4, 3) not null check (floral between 0 and 1),
  fruity numeric(4, 3) not null check (fruity between 0 and 1),
  chocolate numeric(4, 3) not null check (chocolate between 0 and 1),
  nutty numeric(4, 3) not null check (nutty between 0 and 1),
  spice numeric(4, 3) not null check (spice between 0 and 1),
  fermented numeric(4, 3) not null check (fermented between 0 and 1),
  clarity numeric(4, 3) not null check (clarity between 0 and 1),
  roast numeric(4, 3) not null check (roast between 0 and 1),
  brew_ratio numeric(4, 3) not null check (brew_ratio between 0 and 1),
  extraction numeric(4, 3) not null check (extraction between 0 and 1),
  difficulty numeric(4, 3) not null check (difficulty between 0 and 1),
  vector jsonb not null default '[]'::jsonb,

  -- Denormalized categorical metadata, copied from the recipe/coffee at
  -- calculation time, so the Recommendation/Discovery engines can filter
  -- and score without re-joining back to recipes/coffees every time.
  origin_id uuid references public.origins (id) on delete set null,
  process text,
  roast_level text,
  brewing_method_id uuid references public.brewing_methods (id) on delete set null,
  grinder_id uuid references public.grinders (id) on delete set null,
  device_id uuid references public.devices (id) on delete set null,
  has_xbloom_profile boolean not null default false,
  difficulty_label text,

  calculated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipe_feature_vectors_recipe_id_key unique (recipe_id)
);

comment on table public.recipe_feature_vectors is
  'Calculated, normalized (0-1) sensory feature vectors per recipe, produced by lib/ai/feature-vectors.ts. Powers the Taste Similarity Engine and the Recommendation Engine. Recalculable at any time; never user-entered.';
comment on column public.recipe_feature_vectors.vector is
  'The 15 numeric columns above, ordered per SENSORY_VECTOR_DIMENSIONS, as a flat jsonb number array -- ready to reuse as an embedding input later.';

create index recipe_feature_vectors_recipe_id_idx on public.recipe_feature_vectors (recipe_id);
create index recipe_feature_vectors_origin_id_idx on public.recipe_feature_vectors (origin_id);
create index recipe_feature_vectors_brewing_method_id_idx on public.recipe_feature_vectors (brewing_method_id);
create index recipe_feature_vectors_process_idx on public.recipe_feature_vectors (process);
create index recipe_feature_vectors_roast_level_idx on public.recipe_feature_vectors (roast_level);

create trigger recipe_feature_vectors_set_updated_at
  before update on public.recipe_feature_vectors
  for each row
  execute function public.set_updated_at();

alter table public.recipe_feature_vectors enable row level security;

-- Same visibility delegation as recipe_insights: viewable exactly when
-- the parent recipe is (published, owned by the caller, or admin).
create policy "Recipe feature vectors are viewable when their recipe is"
  on public.recipe_feature_vectors for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_feature_vectors.recipe_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage feature vectors on their own recipes"
  on public.recipe_feature_vectors for all
  using (
    exists (select 1 from public.recipes r where r.id = recipe_feature_vectors.recipe_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = recipe_feature_vectors.recipe_id and r.author_id = auth.uid())
  );

create policy "Admins can manage all recipe feature vectors"
  on public.recipe_feature_vectors for all
  using (public.is_admin())
  with check (public.is_admin());

-- ai_user_profiles: the evolving "AI User Profile" -- a blended
-- preference vector (same 15 dimensions/shape as recipe_feature_vectors,
-- so the two can be compared directly) plus the categorical preferences
-- it distilled from the user's favorites, taste profile, coffee setup,
-- brew history, ratings, reviews, and saved recipes. Recomputed by
-- lib/data/ai.ts#updateTasteProfile after any of those change -- see
-- `signal_count` for how much behavioral evidence went into it.
--
-- Strictly private: this is inferred data about one user, same
-- visibility as user_taste_profiles/user_coffee_setups/user_brew_logs.

create table public.ai_user_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  engine_version text not null default '1.0',

  acidity numeric(4, 3) not null default 0.5 check (acidity between 0 and 1),
  sweetness numeric(4, 3) not null default 0.5 check (sweetness between 0 and 1),
  body numeric(4, 3) not null default 0.5 check (body between 0 and 1),
  bitterness numeric(4, 3) not null default 0.5 check (bitterness between 0 and 1),
  floral numeric(4, 3) not null default 0.5 check (floral between 0 and 1),
  fruity numeric(4, 3) not null default 0.5 check (fruity between 0 and 1),
  chocolate numeric(4, 3) not null default 0.5 check (chocolate between 0 and 1),
  nutty numeric(4, 3) not null default 0.5 check (nutty between 0 and 1),
  spice numeric(4, 3) not null default 0.5 check (spice between 0 and 1),
  fermented numeric(4, 3) not null default 0.5 check (fermented between 0 and 1),
  clarity numeric(4, 3) not null default 0.5 check (clarity between 0 and 1),
  roast numeric(4, 3) not null default 0.5 check (roast between 0 and 1),
  brew_ratio numeric(4, 3) not null default 0.5 check (brew_ratio between 0 and 1),
  extraction numeric(4, 3) not null default 0.5 check (extraction between 0 and 1),
  difficulty numeric(4, 3) not null default 0.5 check (difficulty between 0 and 1),
  vector jsonb not null default '[]'::jsonb,

  preferred_origin_ids uuid[] not null default '{}',
  preferred_processes text[] not null default '{}',
  preferred_roast text,
  preferred_brewing_method_ids uuid[] not null default '{}',
  preferred_grinder_id uuid references public.grinders (id) on delete set null,
  preferred_device_id uuid references public.devices (id) on delete set null,
  owns_xbloom boolean not null default false,
  preferred_difficulty text,
  avg_rating_given numeric(3, 2),

  -- How much behavioral evidence (brews + ratings + reviews + favorites +
  -- completed recipes) has fed into this profile so far. Used to signal
  -- confidence -- a profile with signal_count = 0 is still just the
  -- midpoint defaults above, i.e. "the AI doesn't know this user yet".
  signal_count integer not null default 0,

  computed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ai_user_profiles is
  'The evolving AI User Profile: a blended (explicit taste profile + implicit behavior) preference vector and derived preferences, recomputed by lib/data/ai.ts#updateTasteProfile. Private to the user.';
comment on column public.ai_user_profiles.signal_count is
  'Total behavioral signals (brews, ratings, reviews, favorites) that fed into this profile. Higher = the AI "knows" this user better.';
comment on column public.ai_user_profiles.vector is
  'The 15 numeric columns above, ordered per SENSORY_VECTOR_DIMENSIONS, as a flat jsonb number array -- directly comparable to recipe_feature_vectors.vector.';

create index ai_user_profiles_preferred_roast_idx on public.ai_user_profiles (preferred_roast);
create index ai_user_profiles_updated_at_idx on public.ai_user_profiles (updated_at desc);

create trigger ai_user_profiles_set_updated_at
  before update on public.ai_user_profiles
  for each row
  execute function public.set_updated_at();

alter table public.ai_user_profiles enable row level security;

create policy "Users can view their own AI profile"
  on public.ai_user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can manage their own AI profile"
  on public.ai_user_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all AI profiles"
  on public.ai_user_profiles for all
  using (public.is_admin())
  with check (public.is_admin());
