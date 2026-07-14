-- user_activities: the public Activity Feed. Each row is a lightweight,
-- public record that a user did something noteworthy (brewed a recipe,
-- created a recipe, reviewed a recipe, earned a badge, followed someone).
-- This is intentionally a lighter-weight, public-by-design signal distinct
-- from the detailed, private user_brew_logs entry it may originate from.

create table public.user_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_type text not null check (
    activity_type in ('brewed_recipe', 'created_recipe', 'reviewed_recipe', 'earned_badge', 'followed_user')
  ),
  recipe_id uuid references public.recipes (id) on delete cascade,
  badge_id uuid references public.badges (id) on delete cascade,
  target_user_id uuid references public.profiles (id) on delete cascade,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.user_activities is
  'Public activity feed: brewed/created/reviewed a recipe, earned a badge, followed a user. Written by application code as a side effect of the triggering action.';
comment on column public.user_activities.metadata is
  'Extensible free-form payload (e.g. rating given, brew rating) for feed rendering without extra joins.';

create index user_activities_user_id_idx on public.user_activities (user_id, created_at desc);
create index user_activities_created_at_idx on public.user_activities (created_at desc);
create index user_activities_activity_type_idx on public.user_activities (activity_type);

alter table public.user_activities enable row level security;

create policy "Activity feed entries are publicly viewable"
  on public.user_activities for select
  using (true);

create policy "Users can record their own activity"
  on public.user_activities for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own activity"
  on public.user_activities for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all activity"
  on public.user_activities for all
  using (public.is_admin())
  with check (public.is_admin());
