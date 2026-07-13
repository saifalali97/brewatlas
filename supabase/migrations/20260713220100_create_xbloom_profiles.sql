-- xbloom_profiles: xBloom-specific brewing settings for a recipe. This is
-- NOT a live API integration -- it's a structured settings record a recipe
-- can optionally carry so a future xBloom sync/export feature has
-- something concrete to read from.
--
-- Unlike the reusable `brew_profiles` (Smart Brewing Engine), an xBloom
-- profile belongs to exactly one recipe: `recipe_id` is `unique`, so a
-- recipe has at most one xBloom profile, and that profile can't be
-- attached to any other recipe. Deleting the recipe deletes its profile.

create table public.xbloom_profiles (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  device_model text check (
    device_model in ('xBloom Studio', 'xBloom Original', 'xBloom Lite', 'xBloom Omni')
  ),
  grind_setting text,
  water_temperature numeric(5, 2),
  brew_water numeric(6, 2),
  dose numeric(6, 2),
  bloom_time text,
  flow_rate numeric(5, 2),
  pulse_pattern text,
  pour_sequence text,
  agitation text,
  dripper text,
  filter text,
  total_time text,
  brew_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint xbloom_profiles_recipe_id_key unique (recipe_id)
);

comment on table public.xbloom_profiles is
  'xBloom-specific brewing settings belonging to exactly one recipe (foundation for a future xBloom sync/export feature).';
comment on column public.xbloom_profiles.device_model is
  'Must match one of the seeded public.xbloom_devices names.';
comment on column public.xbloom_profiles.flow_rate is 'Grams per second.';

create index xbloom_profiles_recipe_id_idx on public.xbloom_profiles (recipe_id);

create trigger xbloom_profiles_set_updated_at
  before update on public.xbloom_profiles
  for each row
  execute function public.set_updated_at();

alter table public.xbloom_profiles enable row level security;

-- An xBloom profile is visible exactly when its parent recipe is
-- (published, owned by the caller, or the caller is an admin).
create policy "xBloom profiles are viewable when their recipe is"
  on public.xbloom_profiles for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = xbloom_profiles.recipe_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage the xBloom profile on their own recipes"
  on public.xbloom_profiles for all
  using (
    exists (select 1 from public.recipes r where r.id = xbloom_profiles.recipe_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = xbloom_profiles.recipe_id and r.author_id = auth.uid())
  );

create policy "Admins can manage all xBloom profiles"
  on public.xbloom_profiles for all
  using (public.is_admin())
  with check (public.is_admin());
