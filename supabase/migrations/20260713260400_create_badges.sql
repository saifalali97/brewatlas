-- badges: the achievement catalog (lookup table, admin-managed, same
-- public-read/admin-write pattern as grinders/filter_types/tags). Criteria
-- are evaluated in application code (see lib/data/community.ts) against
-- live stats -- `criteria_description` here is just the human-readable
-- explanation shown in the UI, not executable logic.

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  name text not null,
  description text not null,
  criteria_description text not null,
  icon text not null default 'award',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint badges_key_key unique (key)
);

comment on table public.badges is 'Achievement catalog. Criteria are evaluated in application code, not in the database.';

create index badges_sort_order_idx on public.badges (sort_order);

alter table public.badges enable row level security;

create policy "Badges are viewable by everyone"
  on public.badges for select using (true);

create policy "Admins can manage badges"
  on public.badges for all using (public.is_admin()) with check (public.is_admin());

-- user_badges: which badges each user has earned, and when. Public --
-- badges are meant to be shown on a user's public profile.

create table public.user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

comment on table public.user_badges is
  'Badges earned by each user. Awarded by application code after a qualifying action, never editable by the user directly.';

create index user_badges_badge_id_idx on public.user_badges (badge_id);

alter table public.user_badges enable row level security;

create policy "Earned badges are publicly viewable"
  on public.user_badges for select
  using (true);

-- Badges are only ever inserted by application code running as the earning
-- user, immediately after that user's own action re-evaluates their stats
-- against the badge criteria (see evaluateAndAwardBadges in
-- lib/data/community.ts). There is no update policy: once earned a badge
-- is permanent, and no user-facing delete (only admins can remove one).
create policy "Users can be awarded badges for themselves"
  on public.user_badges for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all user badges"
  on public.user_badges for all
  using (public.is_admin())
  with check (public.is_admin());
