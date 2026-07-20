-- Community Platform extensions: comments, reports, achievements, featured content,
-- public collections, public brew sessions, and community analytics RPCs.
--
-- Existing table mapping (do not duplicate):
--   profiles_followers  → user_follows
--   saved_recipes       → favorites
--   collection_recipes  → recipe_collection_items
--   activity_feed       → user_activities
--   notifications       → user_notifications

-- ---------------------------------------------------------------------------
-- Recipe comments (threaded discussion — separate from star reviews)
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_comments (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.recipe_comments (id) on delete cascade,
  body text not null check (char_length(btrim(body)) > 0),
  is_pinned boolean not null default false,
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.recipe_comments is
  'Threaded recipe discussion comments — distinct from recipe_reviews (1 star rating per user).';

create index if not exists recipe_comments_recipe_id_idx on public.recipe_comments (recipe_id, created_at desc);
create index if not exists recipe_comments_user_id_idx on public.recipe_comments (user_id);
create index if not exists recipe_comments_parent_id_idx on public.recipe_comments (parent_id) where parent_id is not null;
create index if not exists recipe_comments_pinned_idx on public.recipe_comments (recipe_id, is_pinned) where is_pinned = true;

drop trigger if exists recipe_comments_set_updated_at on public.recipe_comments;
create trigger recipe_comments_set_updated_at
  before update on public.recipe_comments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Comment likes
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_comment_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  comment_id uuid not null references public.recipe_comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

create index if not exists recipe_comment_likes_comment_id_idx on public.recipe_comment_likes (comment_id);

-- ---------------------------------------------------------------------------
-- Content reports (recipes, comments, users)
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('recipe', 'comment', 'user', 'review')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists recipe_reports_status_idx on public.recipe_reports (status, created_at desc);
create index if not exists recipe_reports_target_idx on public.recipe_reports (target_type, target_id);

-- ---------------------------------------------------------------------------
-- Achievement progress (milestones with progress bars)
-- ---------------------------------------------------------------------------

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_key text not null,
  title text not null,
  description text not null,
  progress integer not null default 0 check (progress >= 0),
  target integer not null default 1 check (target > 0),
  unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, achievement_key)
);

create index if not exists user_achievements_user_id_idx on public.user_achievements (user_id);

drop trigger if exists user_achievements_set_updated_at on public.user_achievements;
create trigger user_achievements_set_updated_at
  before update on public.user_achievements
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Featured community content (admin-managed)
-- ---------------------------------------------------------------------------

create table if not exists public.featured_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  headline text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  featured_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.featured_roasters (
  id uuid primary key default gen_random_uuid(),
  roaster_id uuid not null references public.roasters (id) on delete cascade,
  headline text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  featured_at timestamptz not null default now(),
  unique (roaster_id)
);

create table if not exists public.featured_cafes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  city text,
  website_url text,
  headline text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  featured_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Extend collections: public + shareable + preset kinds
-- ---------------------------------------------------------------------------

alter table public.recipe_collections
  add column if not exists description text,
  add column if not exists is_public boolean not null default false,
  add column if not exists share_slug text unique,
  add column if not exists collection_kind text not null default 'custom'
    check (collection_kind in ('favorites', 'competition', 'daily', 'travel', 'custom'));

create index if not exists recipe_collections_public_idx
  on public.recipe_collections (is_public, share_slug) where is_public = true;

-- ---------------------------------------------------------------------------
-- Public brew sessions on profiles
-- ---------------------------------------------------------------------------

alter table public.brew_sessions
  add column if not exists is_public boolean not null default false;

create index if not exists brew_sessions_public_user_idx
  on public.brew_sessions (user_id, is_public, created_at desc) where is_public = true;

-- ---------------------------------------------------------------------------
-- Extend activity feed types
-- ---------------------------------------------------------------------------

alter table public.user_activities drop constraint if exists user_activities_activity_type_check;
alter table public.user_activities add constraint user_activities_activity_type_check
  check (activity_type in (
    'brewed_recipe', 'created_recipe', 'reviewed_recipe', 'earned_badge',
    'followed_user', 'saved_recipe', 'added_to_collection',
    'liked_recipe', 'commented_recipe', 'completed_brew_session',
    'official_recipe_published', 'admin_featured_recipe'
  ));

-- ---------------------------------------------------------------------------
-- Compatibility views (read-only aliases for spec table names)
-- ---------------------------------------------------------------------------

create or replace view public.saved_recipes as
  select user_id, recipe_id, created_at from public.favorites;

create or replace view public.profiles_followers as
  select follower_id, following_id, created_at from public.user_follows;

create or replace view public.collection_recipes as
  select collection_id, recipe_id, created_at from public.recipe_collection_items;

create or replace view public.activity_feed as
  select id, user_id, activity_type, recipe_id, badge_id, target_user_id, metadata, created_at
  from public.user_activities;

-- Maps spec name `notifications` → existing `user_notifications` table.
-- Real columns: user_id (recipient), is_read (boolean). No recipient_id/read_at columns exist.
create or replace view public.notifications as
  select
    id,
    user_id as recipient_id,
    actor_id,
    notification_type,
    recipe_id,
    badge_id,
    title,
    message,
    metadata,
    case when is_read then created_at else null end as read_at,
    created_at
  from public.user_notifications;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.recipe_comments enable row level security;
alter table public.recipe_comment_likes enable row level security;
alter table public.recipe_reports enable row level security;
alter table public.user_achievements enable row level security;
alter table public.featured_users enable row level security;
alter table public.featured_roasters enable row level security;
alter table public.featured_cafes enable row level security;

drop policy if exists "Comments are publicly readable" on public.recipe_comments;
create policy "Comments are publicly readable"
  on public.recipe_comments for select using (true);

drop policy if exists "Users manage own comments" on public.recipe_comments;
create policy "Users manage own comments"
  on public.recipe_comments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins manage all comments" on public.recipe_comments;
create policy "Admins manage all comments"
  on public.recipe_comments for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Comment likes are publicly readable" on public.recipe_comment_likes;
create policy "Comment likes are publicly readable"
  on public.recipe_comment_likes for select using (true);

drop policy if exists "Users manage own comment likes" on public.recipe_comment_likes;
create policy "Users manage own comment likes"
  on public.recipe_comment_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users create reports" on public.recipe_reports;
create policy "Users create reports"
  on public.recipe_reports for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "Users view own reports" on public.recipe_reports;
create policy "Users view own reports"
  on public.recipe_reports for select
  using (auth.uid() = reporter_id or public.is_admin());

drop policy if exists "Admins manage reports" on public.recipe_reports;
create policy "Admins manage reports"
  on public.recipe_reports for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Achievements are publicly readable" on public.user_achievements;
create policy "Achievements are publicly readable"
  on public.user_achievements for select using (true);

drop policy if exists "System inserts achievements for self" on public.user_achievements;
create policy "System inserts achievements for self"
  on public.user_achievements for insert
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users update own achievement progress" on public.user_achievements;
create policy "Users update own achievement progress"
  on public.user_achievements for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Featured users are publicly readable" on public.featured_users;
create policy "Featured users are publicly readable"
  on public.featured_users for select using (is_active = true or public.is_admin());

drop policy if exists "Admins manage featured users" on public.featured_users;
create policy "Admins manage featured users"
  on public.featured_users for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Featured roasters are publicly readable" on public.featured_roasters;
create policy "Featured roasters are publicly readable"
  on public.featured_roasters for select using (is_active = true or public.is_admin());

drop policy if exists "Admins manage featured roasters" on public.featured_roasters;
create policy "Admins manage featured roasters"
  on public.featured_roasters for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Featured cafes are publicly readable" on public.featured_cafes;
create policy "Featured cafes are publicly readable"
  on public.featured_cafes for select using (is_active = true or public.is_admin());

drop policy if exists "Admins manage featured cafes" on public.featured_cafes;
create policy "Admins manage featured cafes"
  on public.featured_cafes for all
  using (public.is_admin()) with check (public.is_admin());

-- Public collections readable by anyone
drop policy if exists "Public collections are viewable" on public.recipe_collections;
create policy "Public collections are viewable"
  on public.recipe_collections for select
  using (is_public = true or auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can manage their own collections" on public.recipe_collections;
create policy "Users can manage their own collections"
  on public.recipe_collections for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can manage items in their own collections" on public.recipe_collection_items;
create policy "Users can manage items in their own collections"
  on public.recipe_collection_items for all
  using (
    exists (
      select 1 from public.recipe_collections rc
      where rc.id = collection_id and (rc.user_id = auth.uid() or rc.is_public = true or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.recipe_collections rc
      where rc.id = collection_id and (rc.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Public collection items are viewable" on public.recipe_collection_items;
create policy "Public collection items are viewable"
  on public.recipe_collection_items for select
  using (
    exists (
      select 1 from public.recipe_collections rc
      where rc.id = collection_id and rc.is_public = true
    )
    or exists (
      select 1 from public.recipe_collections rc
      where rc.id = collection_id and rc.user_id = auth.uid()
    )
    or public.is_admin()
  );

-- Public brew sessions
drop policy if exists "Public brew sessions are viewable" on public.brew_sessions;
create policy "Public brew sessions are viewable"
  on public.brew_sessions for select
  using (is_public = true or auth.uid() = user_id or public.is_admin());

-- ---------------------------------------------------------------------------
-- Additional badges
-- ---------------------------------------------------------------------------

insert into public.badges (key, name, description, criteria_description, icon, sort_order) values
  ('hundred_brews', '100 Brews', 'Logged one hundred brew sessions.', 'Log 100 brew sessions.', 'coffee', 11),
  ('coffee_explorer', 'Coffee Explorer', 'Explored diverse origins and methods.', 'Brew 10+ distinct origins.', 'compass', 12),
  ('top_reviewer', 'Top Reviewer', 'Highly rated community reviewer.', 'Receive 10+ helpful votes on reviews.', 'star', 13),
  ('official_contributor', 'Official Contributor', 'Contributed to the Official Recipe Library.', 'Publish an official verified recipe.', 'badge-check', 14),
  ('competition_brewer', 'Competition Brewer', 'Competition-focused brewer.', 'Log 5+ competition-tagged brew sessions.', 'trophy', 15)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- RPC: recipe comments with sort + like counts
-- ---------------------------------------------------------------------------

create or replace function public.get_recipe_comments(
  p_recipe_id uuid,
  p_sort text default 'newest',
  p_limit integer default 50,
  p_offset integer default 0,
  p_viewer_id uuid default null
)
returns table (
  id uuid,
  recipe_id uuid,
  user_id uuid,
  parent_id uuid,
  body text,
  is_pinned boolean,
  is_edited boolean,
  like_count bigint,
  viewer_liked boolean,
  author_name text,
  author_avatar text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.recipe_id,
    c.user_id,
    c.parent_id,
    c.body,
    c.is_pinned,
    c.is_edited,
    (select count(*) from public.recipe_comment_likes l where l.comment_id = c.id) as like_count,
    exists (
      select 1 from public.recipe_comment_likes vl
      where vl.comment_id = c.id and vl.user_id = p_viewer_id
    ) as viewer_liked,
    p.full_name as author_name,
    p.avatar_url as author_avatar,
    c.created_at,
    c.updated_at
  from public.recipe_comments c
  join public.profiles p on p.id = c.user_id
  where c.recipe_id = p_recipe_id
  order by
    c.is_pinned desc,
    case when p_sort = 'oldest' then c.created_at end asc,
    case when p_sort = 'top' then (select count(*) from public.recipe_comment_likes l where l.comment_id = c.id) end desc,
    c.created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

revoke all on function public.get_recipe_comments(uuid, text, integer, integer, uuid) from public;
grant execute on function public.get_recipe_comments(uuid, text, integer, integer, uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPC: admin community analytics (anonymous aggregates)
-- ---------------------------------------------------------------------------

create or replace function public.admin_community_analytics(p_days integer default 30)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'dailyActiveUsers', (
      select count(distinct user_id) from public.user_activities
      where created_at >= now() - make_interval(days => p_days)
    ),
    'newUsers', (
      select count(*) from public.profiles
      where created_at >= now() - make_interval(days => p_days)
    ),
    'recipesCreated', (
      select count(*) from public.recipes
      where created_at >= now() - make_interval(days => p_days)
    ),
    'brewsLogged', (
      select count(*) from public.user_brew_logs
      where brewed_at >= now() - make_interval(days => p_days)
    ) + (
      select count(*) from public.brew_sessions
      where created_at >= now() - make_interval(days => p_days)
    ),
    'comments', (
      select count(*) from public.recipe_comments
      where created_at >= now() - make_interval(days => p_days)
    ),
    'likes', (
      select count(*) from public.recipe_likes
      where created_at >= now() - make_interval(days => p_days)
    ),
    'followers', (
      select count(*) from public.user_follows
      where created_at >= now() - make_interval(days => p_days)
    ),
    'openReports', (
      select count(*) from public.recipe_reports where status = 'open'
    ),
    'topRecipes', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select title as name, count(*)::bigint as count
        from public.recipe_likes rl
        join public.recipes rec on rec.id = rl.recipe_id
        where rl.created_at >= now() - make_interval(days => p_days)
        group by rec.title order by count(*) desc limit 8
      ) r
    ),
    'topUsers', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select coalesce(p.full_name, 'Member') as name, ucs.brew_score::bigint as count
        from public.user_community_stats ucs
        join public.profiles p on p.id = ucs.user_id
        order by ucs.brew_score desc limit 8
      ) r
    )
  )
  where public.is_admin();
$$;

revoke all on function public.admin_community_analytics(integer) from public;
grant execute on function public.admin_community_analytics(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC: search public profiles
-- ---------------------------------------------------------------------------

create or replace function public.search_community_users(
  p_query text,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  country text,
  bio text,
  followers_count integer,
  brew_score integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.full_name,
    p.avatar_url,
    p.country,
    p.bio,
    coalesce(ucs.followers_count, 0) as followers_count,
    coalesce(ucs.brew_score, 0) as brew_score
  from public.profiles p
  left join public.user_community_stats ucs on ucs.user_id = p.id
  where p.profile_visibility = 'public'
    and (
      p_query is null or btrim(p_query) = ''
      or p.full_name ilike '%' || p_query || '%'
      or p.country ilike '%' || p_query || '%'
      or p.bio ilike '%' || p_query || '%'
    )
  order by coalesce(ucs.brew_score, 0) desc, p.full_name asc nulls last
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
$$;

revoke all on function public.search_community_users(text, integer, integer) from public;
grant execute on function public.search_community_users(text, integer, integer) to anon, authenticated;
