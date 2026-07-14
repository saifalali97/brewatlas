-- user_brew_logs: "Brewing History" -- a personal log of individual brew
-- sessions, independent of (but optionally linked to) a saved recipe.
-- Powers both the personal dashboard aggregates (lib/data/personal.ts)
-- and, later, AI recommendations trained on what a user actually brewed
-- and how they rated it.
--
-- `is_favorite` here marks a specific *brew session* as a favorite (e.g.
-- "that particular batch was great"), which is a finer grain than -- and
-- intentionally independent of -- the existing public.favorites table,
-- which favorites a recipe as a whole.

create table public.user_brew_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete set null,
  brewed_at timestamptz not null default now(),
  brewing_device_id uuid references public.devices (id) on delete set null,
  brewing_method_id uuid references public.brewing_methods (id) on delete set null,
  rating smallint check (rating between 1 and 5),
  is_favorite boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

comment on table public.user_brew_logs is
  'A personal log of brew sessions ("Brewing History"): what was brewed, when, with what device/method, how it was rated, and whether it was a favorite batch.';
comment on column public.user_brew_logs.recipe_id is
  'The saved recipe this brew followed, if any. Nullable -- a brew can be logged without one.';
comment on column public.user_brew_logs.rating is
  'Overall satisfaction with this specific brew session, 1-5 stars.';
comment on column public.user_brew_logs.is_favorite is
  'Marks this specific brew session as a favorite, independent of public.favorites (which favorites a recipe as a whole).';

create index user_brew_logs_user_id_idx on public.user_brew_logs (user_id);
create index user_brew_logs_recipe_id_idx on public.user_brew_logs (recipe_id);
create index user_brew_logs_brewed_at_idx on public.user_brew_logs (brewed_at desc);
create index user_brew_logs_user_brewed_at_idx on public.user_brew_logs (user_id, brewed_at desc);

alter table public.user_brew_logs enable row level security;

create policy "Users can manage their own brew logs"
  on public.user_brew_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all brew logs"
  on public.user_brew_logs for all
  using (public.is_admin())
  with check (public.is_admin());
