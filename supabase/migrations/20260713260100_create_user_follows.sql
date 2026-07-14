-- user_follows: the social graph behind "Followers" -- who follows whom.
-- Modeled as a simple directed join table, same shape as `favorites`.
-- Follow relationships are public information (shown as follower/following
-- counts and lists on a public profile), unlike the strictly private
-- tables in the Personal Experience system.

create table public.user_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint user_follows_no_self_follow check (follower_id <> following_id)
);

comment on table public.user_follows is
  'Directed social graph: follower_id follows following_id. Public data, powers followers/following counts on profiles.';

create index user_follows_following_id_idx on public.user_follows (following_id);
create index user_follows_follower_id_idx on public.user_follows (follower_id);

alter table public.user_follows enable row level security;

-- Follow relationships are public, matching the public profile they appear on.
create policy "Follow relationships are publicly viewable"
  on public.user_follows for select
  using (true);

create policy "Users can follow as themselves"
  on public.user_follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow as themselves"
  on public.user_follows for delete
  using (auth.uid() = follower_id);

create policy "Admins can manage all follows"
  on public.user_follows for all
  using (public.is_admin())
  with check (public.is_admin());
