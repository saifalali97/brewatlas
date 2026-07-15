-- Phase 24: owner analytics, user moderation, recipe view tracking.

alter table public.profiles
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

comment on column public.profiles.suspended_at is
  'When set, the account is suspended and cannot use authenticated features.';
comment on column public.profiles.suspension_reason is
  'Optional moderator note explaining the suspension.';

create index if not exists profiles_suspended_at_idx on public.profiles (suspended_at)
  where suspended_at is not null;

-- Append-only log of admin/owner moderation and management actions.
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  target_type text not null,
  target_id text not null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.admin_audit_log is
  'Append-only audit trail for owner dashboard moderation and admin actions.';

create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_actor_id_idx on public.admin_audit_log (actor_id);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log (target_type, target_id);

alter table public.admin_audit_log enable row level security;

create policy "Admins can read audit log"
  on public.admin_audit_log for select
  using (public.is_admin());

create policy "Admins can insert audit log"
  on public.admin_audit_log for insert
  with check (public.is_admin());

-- Lightweight recipe view tracking for analytics (no PII beyond optional user id).
create table if not exists public.recipe_views (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  viewer_id uuid references public.profiles (id) on delete set null,
  viewed_at timestamptz not null default now()
);

comment on table public.recipe_views is
  'Aggregated page views for recipe analytics. Inserts are open to authenticated and anon callers via RPC.';

create index if not exists recipe_views_recipe_id_idx on public.recipe_views (recipe_id, viewed_at desc);
create index if not exists recipe_views_viewed_at_idx on public.recipe_views (viewed_at desc);

alter table public.recipe_views enable row level security;

create policy "Admins can read recipe views"
  on public.recipe_views for select
  using (public.is_admin());

-- Record a recipe view (callable by anyone; dedupes same viewer/recipe within 30 minutes).
create or replace function public.record_recipe_view(p_recipe_id uuid, p_viewer_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_viewer_id is not null then
    if exists (
      select 1
      from public.recipe_views
      where recipe_id = p_recipe_id
        and viewer_id = p_viewer_id
        and viewed_at >= now() - interval '30 minutes'
    ) then
      return;
    end if;
  end if;

  insert into public.recipe_views (recipe_id, viewer_id)
  values (p_recipe_id, p_viewer_id);
end;
$$;

grant execute on function public.record_recipe_view(uuid, uuid) to anon, authenticated;

-- Monthly signup counts for owner charts.
create or replace function public.owner_monthly_signups(months integer default 6)
returns table (month_label text, signup_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  with bounds as (
    select date_trunc('month', now()) - ((months - 1) || ' months')::interval as start_month
  ),
  series as (
    select generate_series(
      (select start_month from bounds),
      date_trunc('month', now()),
      interval '1 month'
    ) as month_start
  )
  select
    to_char(s.month_start, 'Mon') as month_label,
    coalesce(count(p.id), 0)::bigint as signup_count
  from series s
  left join public.profiles p
    on date_trunc('month', p.created_at) = s.month_start
  group by s.month_start, month_label
  order by s.month_start;
$$;

grant execute on function public.owner_monthly_signups(integer) to authenticated;

-- Active users from community activity signals.
create or replace function public.owner_active_user_counts()
returns table (daily_active bigint, weekly_active bigint, monthly_active bigint)
language sql
security definer
set search_path = public
stable
as $$
  with activity_users as (
    select user_id, created_at as active_at from public.user_activities
    union all
    select user_id, brewed_at from public.user_brew_logs
    union all
    select user_id, created_at from public.favorites
    union all
    select user_id, created_at from public.recipe_reviews
  )
  select
    count(distinct user_id) filter (where active_at >= now() - interval '1 day') as daily_active,
    count(distinct user_id) filter (where active_at >= now() - interval '7 days') as weekly_active,
    count(distinct user_id) filter (where active_at >= now() - interval '30 days') as monthly_active
  from activity_users;
$$;

grant execute on function public.owner_active_user_counts() to authenticated;

-- Top countries by profile count.
create or replace function public.owner_top_countries(result_limit integer default 8)
returns table (country text, user_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(nullif(trim(country), ''), 'Unknown') as country, count(*)::bigint as user_count
  from public.profiles
  where suspended_at is null
  group by 1
  order by user_count desc, country asc
  limit result_limit;
$$;

grant execute on function public.owner_top_countries(integer) to authenticated;

-- Preferred brew methods/devices from profile favorites.
create or replace function public.owner_preferred_brew_methods(result_limit integer default 8)
returns table (method_name text, user_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select bm.name as method_name, count(*)::bigint as user_count
  from public.profiles p
  join public.brewing_methods bm on bm.id = p.favorite_brewing_method_id
  where p.suspended_at is null
  group by bm.name
  order by user_count desc, method_name asc
  limit result_limit;
$$;

grant execute on function public.owner_preferred_brew_methods(integer) to authenticated;

create or replace function public.owner_preferred_devices(result_limit integer default 8)
returns table (device_name text, user_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select d.name as device_name, count(*)::bigint as user_count
  from public.profiles p
  join public.devices d on d.id = p.favorite_device_id
  where p.suspended_at is null
  group by d.name
  order by user_count desc, device_name asc
  limit result_limit;
$$;

grant execute on function public.owner_preferred_devices(integer) to authenticated;

-- Recipe leaderboard for owner analytics.
create or replace function public.owner_recipe_leaderboard(result_limit integer default 10)
returns table (
  recipe_id uuid,
  title text,
  slug text,
  view_count bigint,
  save_count bigint,
  brew_count bigint,
  average_rating numeric,
  review_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    r.id as recipe_id,
    r.title,
    r.slug,
    coalesce(v.view_count, 0) as view_count,
    coalesce(f.save_count, 0) as save_count,
    coalesce(b.brew_count, 0) as brew_count,
    coalesce(rs.average_rating, 0) as average_rating,
    coalesce(rs.review_count, 0) as review_count
  from public.recipes r
  left join (
    select recipe_id, count(*) as view_count from public.recipe_views group by recipe_id
  ) v on v.recipe_id = r.id
  left join (
    select recipe_id, count(*) as save_count from public.favorites group by recipe_id
  ) f on f.recipe_id = r.id
  left join (
    select recipe_id, count(*) as brew_count from public.user_brew_logs group by recipe_id
  ) b on b.recipe_id = r.id
  left join public.recipe_rating_summary rs on rs.recipe_id = r.id
  where r.published = true
  order by view_count desc, save_count desc, brew_count desc
  limit result_limit;
$$;

grant execute on function public.owner_recipe_leaderboard(integer) to authenticated;
