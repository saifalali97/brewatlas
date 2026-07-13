-- BrewAtlas AI Coach: append-only history of every deterministic,
-- rule-based recipe analysis run by lib/ai/coach-engine.ts.
--
-- Mirrors the subscription_history precedent (membership system): one
-- row per analysis run, never updated, never deleted -- so a user can
-- see how a recipe's Brew Score changed as they iterated (requirement
-- 10/11: "database tables for future AI history" / "store previous
-- analyses"). Nothing here is entered directly by a user; every row is
-- produced by analyzeRecipeForCoaching() and inserted by
-- lib/data/ai-coach.ts.
--
-- `metrics`/`messages` store the full per-metric breakdown and coaching
-- copy as jsonb -- see types/coach.ts for the exact shape
-- (CoachMetricEvaluation[] / CoachMessage[]) -- so historical rows stay
-- fully self-describing even if the engine's scoring model changes
-- later (see engine_version).

create table public.ai_coach_analyses (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  engine_version text not null default '1.0',

  brew_score integer not null check (brew_score between 0 and 100),
  confidence_level text not null check (confidence_level in ('low', 'medium', 'high')),
  confidence_score numeric(4, 3) not null check (confidence_score between 0 and 1),
  metrics_scored integer not null default 0,
  metrics_total integer not null default 15,

  extraction_risk text check (extraction_risk in ('Under-extraction risk', 'Balanced', 'Over-extraction risk')),
  beverage_strength text check (beverage_strength in ('Light', 'Balanced', 'Strong')),

  -- CoachMetricEvaluation[] (types/coach.ts) -- one entry per one of the
  -- 15 evaluated metrics (brew ratio, extraction, grind size, bloom,
  -- water temperature, pouring structure, brew time, agitation,
  -- strength, clarity, sweetness, acidity, bitterness, body, balance).
  metrics jsonb not null default '[]'::jsonb,
  -- CoachMessage[] (types/coach.ts) -- the plain-language coaching copy
  -- generated from the metrics above.
  messages jsonb not null default '[]'::jsonb,
  strengths text[] not null default '{}',
  weaknesses text[] not null default '{}',
  suggestions text[] not null default '{}',

  created_at timestamptz not null default now()
);

comment on table public.ai_coach_analyses is
  'Append-only history of AI Coach analyses (lib/ai/coach-engine.ts). Never updated or deleted -- lets a user compare Brew Scores across recipe iterations. Fully reusable/rule-based today; engine_version lets a future LLM-assisted scoring model (see lib/ai/coach-adapter.ts) be identified without breaking old rows.';
comment on column public.ai_coach_analyses.metrics is
  'CoachMetricEvaluation[] from types/coach.ts -- one entry per evaluated metric, in COACH_METRIC_KEYS order.';
comment on column public.ai_coach_analyses.messages is
  'CoachMessage[] from types/coach.ts -- the plain-language coaching messages generated from `metrics`.';
comment on column public.ai_coach_analyses.confidence_score is
  'metrics_scored / metrics_total -- how much of the analysis was backed by real recipe data vs. unscored (missing) metrics.';

create index ai_coach_analyses_recipe_id_idx on public.ai_coach_analyses (recipe_id, created_at desc);
create index ai_coach_analyses_user_id_idx on public.ai_coach_analyses (user_id, created_at desc);

alter table public.ai_coach_analyses enable row level security;

-- Strictly private history, same visibility model as subscription_history
-- and trial_usage: a user only ever sees their own past analyses.
create policy "Users can view their own AI Coach analyses"
  on public.ai_coach_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert their own AI Coach analyses"
  on public.ai_coach_analyses for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all AI Coach analyses"
  on public.ai_coach_analyses for all
  using (public.is_admin())
  with check (public.is_admin());
