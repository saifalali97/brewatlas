-- xbloom_profile_steps: the ordered pulse/pour timeline for an xBloom
-- profile (mirrors `recipe_pours` / `brew_profile_steps`, scoped to a
-- single xBloom profile).

create table public.xbloom_profile_steps (
  id uuid primary key default gen_random_uuid(),
  xbloom_profile_id uuid not null references public.xbloom_profiles (id) on delete cascade,
  step_number integer not null check (step_number > 0),
  water_amount numeric(6, 2),
  flow_rate numeric(5, 2),
  delay text,
  description text,
  created_at timestamptz not null default now(),
  constraint xbloom_profile_steps_profile_step_key unique (xbloom_profile_id, step_number)
);

comment on table public.xbloom_profile_steps is
  'Ordered pulse/pour steps belonging to an xBloom profile.';
comment on column public.xbloom_profile_steps.flow_rate is 'Grams per second for this step.';
comment on column public.xbloom_profile_steps.delay is 'Wait time before/after this step, e.g. "0:10".';

create index xbloom_profile_steps_profile_id_idx on public.xbloom_profile_steps (xbloom_profile_id);

alter table public.xbloom_profile_steps enable row level security;

-- A step is visible exactly when its parent xBloom profile (and in turn its
-- recipe) is.
create policy "xBloom profile steps are viewable when their profile is"
  on public.xbloom_profile_steps for select
  using (
    exists (
      select 1 from public.xbloom_profiles p
      join public.recipes r on r.id = p.recipe_id
      where p.id = xbloom_profile_steps.xbloom_profile_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage steps on their own xBloom profiles"
  on public.xbloom_profile_steps for all
  using (
    exists (
      select 1 from public.xbloom_profiles p
      join public.recipes r on r.id = p.recipe_id
      where p.id = xbloom_profile_steps.xbloom_profile_id and r.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.xbloom_profiles p
      join public.recipes r on r.id = p.recipe_id
      where p.id = xbloom_profile_steps.xbloom_profile_id and r.author_id = auth.uid()
    )
  );

create policy "Admins can manage all xBloom profile steps"
  on public.xbloom_profile_steps for all
  using (public.is_admin())
  with check (public.is_admin());
