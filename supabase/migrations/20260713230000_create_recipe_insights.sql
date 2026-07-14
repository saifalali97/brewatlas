-- recipe_insights: automatically calculated analysis for a recipe, produced
-- by the BrewAtlas Recipe Intelligence Engine (`lib/intelligence/recipe-analysis.ts`).
--
-- This is deliberately a separate table from `recipes`, not new columns on
-- it: everything here is *derived* from a recipe's user-entered brewing
-- parameters, never entered by a user directly, and can be fully
-- recalculated at any time (e.g. after the scoring model changes -- see
-- `engine_version`). Keeping calculated values out of `recipes` means the
-- existing Recipe Engine and xBloom Engine are untouched and this table can
-- be dropped/rebuilt without any risk to user data.
--
-- A recipe has at most one insights row (`recipe_id` is unique); recalculating
-- upserts it.

create table public.recipe_insights (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  engine_version text not null default '1.0',

  -- Calculated brewing metrics.
  brew_ratio text,
  brew_ratio_value numeric(6, 2),
  beverage_strength text check (beverage_strength in ('Light', 'Balanced', 'Strong')),
  extraction_risk text check (
    extraction_risk in ('Under-extraction risk', 'Balanced', 'Over-extraction risk')
  ),
  difficulty_score numeric(4, 1) check (difficulty_score between 1 and 10),

  -- Predicted sensory profile (distinct from the user-entered actual
  -- results on `recipes.sweetness` / `acidity` / `body` / `bitterness`).
  expected_sweetness numeric(4, 1) check (expected_sweetness between 1 and 10),
  expected_acidity numeric(4, 1) check (expected_acidity between 1 and 10),
  expected_body numeric(4, 1) check (expected_body between 1 and 10),
  expected_clarity numeric(4, 1) check (expected_clarity between 1 and 10),
  expected_finish numeric(4, 1) check (expected_finish between 1 and 10),

  calculated_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipe_insights_recipe_id_key unique (recipe_id)
);

comment on table public.recipe_insights is
  'Automatically calculated recipe analysis (brew ratio, strength, extraction risk, difficulty, expected sensory profile), produced by the Recipe Intelligence Engine and kept separate from user-entered values.';
comment on column public.recipe_insights.engine_version is
  'Version tag of the scoring model that produced this row; bumped whenever the analysis functions change so stale rows can be identified.';
comment on column public.recipe_insights.brew_ratio_value is
  'Numeric water-to-coffee ratio (e.g. 16.2 for "1:16.2"), for sorting/filtering; brew_ratio holds the display string.';
comment on column public.recipe_insights.expected_sweetness is
  'Predicted sensory score (1-10), not the user-entered actual result stored on recipes.sweetness.';

create index recipe_insights_recipe_id_idx on public.recipe_insights (recipe_id);

create trigger recipe_insights_set_updated_at
  before update on public.recipe_insights
  for each row
  execute function public.set_updated_at();

alter table public.recipe_insights enable row level security;

-- Insights are visible exactly when their parent recipe is (published,
-- owned by the caller, or the caller is an admin) -- same delegation
-- pattern as recipe_pours/xbloom_profiles.
create policy "Recipe insights are viewable when their recipe is"
  on public.recipe_insights for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_insights.recipe_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

-- Recalculation is triggered from within the recipe author's own session
-- (there is no separate background job runner in this app), so the author
-- of the parent recipe may write its insights.
create policy "Authors can manage insights on their own recipes"
  on public.recipe_insights for all
  using (
    exists (select 1 from public.recipes r where r.id = recipe_insights.recipe_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = recipe_insights.recipe_id and r.author_id = auth.uid())
  );

create policy "Admins can manage all recipe insights"
  on public.recipe_insights for all
  using (public.is_admin())
  with check (public.is_admin());
