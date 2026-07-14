-- brew_profile_steps: the ordered, granular pour/agitation timeline for a
-- brew profile (mirrors `recipe_pours`, but scoped to a reusable brew
-- profile rather than a single recipe).

create table public.brew_profile_steps (
  id uuid primary key default gen_random_uuid(),
  brew_profile_id uuid not null references public.brew_profiles (id) on delete cascade,
  step_number integer not null check (step_number > 0),
  water_amount numeric(6, 2),
  pour_duration text,
  wait_after text,
  description text,
  created_at timestamptz not null default now(),
  constraint brew_profile_steps_profile_step_key unique (brew_profile_id, step_number)
);

comment on table public.brew_profile_steps is
  'Ordered pour/agitation steps belonging to a brew profile.';

create index brew_profile_steps_brew_profile_id_idx on public.brew_profile_steps (brew_profile_id);

alter table public.brew_profile_steps enable row level security;

-- Steps are visible exactly when their parent profile is (currently always,
-- since brew_profiles are public-read).
create policy "Brew profile steps are viewable by everyone"
  on public.brew_profile_steps for select
  using (true);

create policy "Owners can manage steps on their own brew profiles"
  on public.brew_profile_steps for all
  using (
    exists (
      select 1 from public.brew_profiles p
      where p.id = brew_profile_steps.brew_profile_id
        and p.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.brew_profiles p
      where p.id = brew_profile_steps.brew_profile_id
        and p.created_by = auth.uid()
    )
  );

create policy "Admins can manage all brew profile steps"
  on public.brew_profile_steps for all
  using (public.is_admin())
  with check (public.is_admin());
