-- user_community_stats: a public, denormalized summary of each user's
-- community activity. This is what powers "Brewing statistics" on a public
-- profile and every leaderboard, without exposing the private underlying
-- rows (user_brew_logs is owner-only) or making every profile/leaderboard
-- view pay for a fan-out of aggregate queries across many tables.
--
-- Rows are written *only* by refresh_user_community_stats(), a SECURITY
-- DEFINER function that bypasses RLS to read the private source tables it
-- aggregates. There is deliberately no insert/update/delete policy for
-- regular users -- the table is read-only from the client's perspective.

create table public.user_community_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  total_brews integer not null default 0,
  recipes_created integer not null default 0,
  reviews_written integer not null default 0,
  helpful_votes_received integer not null default 0,
  recipes_liked integer not null default 0,
  recipes_saved integer not null default 0,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  -- Weighted composite used by the "Top Brewers" leaderboard and shown as
  -- the user's Brew Score. Formula (documented here as the single source
  -- of truth, applied inside refresh_user_community_stats):
  --   brews x2 + recipes_created x8 + reviews_written x4
  --   + helpful_votes_received x3 + recipes_saved x1 + followers_count x2
  brew_score integer not null default 0,
  -- Simpler recency/volume signal used by the "Most Active Users"
  -- leaderboard: brews + (recipes_created x3) + (reviews_written x2).
  activity_score integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table public.user_community_stats is
  'Public, denormalized per-user community stats (brewing statistics, Brew Score, activity score). Written only by refresh_user_community_stats().';

create index user_community_stats_brew_score_idx on public.user_community_stats (brew_score desc);
create index user_community_stats_activity_score_idx on public.user_community_stats (activity_score desc);
create index user_community_stats_recipes_created_idx on public.user_community_stats (recipes_created desc);
create index user_community_stats_helpful_votes_idx on public.user_community_stats (helpful_votes_received desc);

alter table public.user_community_stats enable row level security;

create policy "Community stats are publicly viewable"
  on public.user_community_stats for select
  using (true);

-- No insert/update/delete policy: writes only happen via the SECURITY
-- DEFINER refresh function below, which bypasses RLS entirely. Admins are
-- still granted an explicit escape hatch for support tooling.
create policy "Admins can manage all community stats"
  on public.user_community_stats for all
  using (public.is_admin())
  with check (public.is_admin());

-- Recomputes and upserts the community stats row for a single user by
-- aggregating across the (mostly owner-only) source tables. SECURITY
-- DEFINER + a fixed search_path let it read those tables regardless of the
-- calling user's own RLS visibility, while only ever writing the one row
-- it was asked to recompute (never anyone else's).
create or replace function public.refresh_user_community_stats(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_brews integer;
  v_recipes_created integer;
  v_reviews_written integer;
  v_helpful_votes_received integer;
  v_recipes_liked integer;
  v_recipes_saved integer;
  v_followers_count integer;
  v_following_count integer;
  v_brew_score integer;
  v_activity_score integer;
begin
  select count(*) into v_total_brews
  from public.user_brew_logs
  where user_id = target_user_id;

  select count(*) into v_recipes_created
  from public.recipes
  where author_id = target_user_id and published = true;

  select count(*) into v_reviews_written
  from public.recipe_reviews
  where user_id = target_user_id;

  select count(*) into v_helpful_votes_received
  from public.recipe_review_helpful_votes hv
  join public.recipe_reviews r on r.id = hv.review_id
  where r.user_id = target_user_id;

  select count(*) into v_recipes_liked
  from public.recipe_likes
  where user_id = target_user_id;

  select count(*) into v_recipes_saved
  from public.favorites
  where user_id = target_user_id;

  select count(*) into v_followers_count
  from public.user_follows
  where following_id = target_user_id;

  select count(*) into v_following_count
  from public.user_follows
  where follower_id = target_user_id;

  v_brew_score := v_total_brews * 2
    + v_recipes_created * 8
    + v_reviews_written * 4
    + v_helpful_votes_received * 3
    + v_recipes_saved * 1
    + v_followers_count * 2;

  v_activity_score := v_total_brews
    + v_recipes_created * 3
    + v_reviews_written * 2;

  insert into public.user_community_stats (
    user_id, total_brews, recipes_created, reviews_written,
    helpful_votes_received, recipes_liked, recipes_saved,
    followers_count, following_count, brew_score, activity_score, updated_at
  )
  values (
    target_user_id, v_total_brews, v_recipes_created, v_reviews_written,
    v_helpful_votes_received, v_recipes_liked, v_recipes_saved,
    v_followers_count, v_following_count, v_brew_score, v_activity_score, now()
  )
  on conflict (user_id) do update set
    total_brews = excluded.total_brews,
    recipes_created = excluded.recipes_created,
    reviews_written = excluded.reviews_written,
    helpful_votes_received = excluded.helpful_votes_received,
    recipes_liked = excluded.recipes_liked,
    recipes_saved = excluded.recipes_saved,
    followers_count = excluded.followers_count,
    following_count = excluded.following_count,
    brew_score = excluded.brew_score,
    activity_score = excluded.activity_score,
    updated_at = now();
end;
$$;

comment on function public.refresh_user_community_stats(uuid) is
  'Recomputes and upserts public.user_community_stats for one user. Call after any action that changes their stats (brew logged, recipe published, review/vote/follow/save/like changed).';

grant execute on function public.refresh_user_community_stats(uuid) to authenticated;
