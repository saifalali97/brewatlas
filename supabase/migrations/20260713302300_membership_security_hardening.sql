-- Phase 1 security hardening: membership tables are read-only for authenticated users.
-- Writes go through service role (server actions, Stripe webhooks) or admin role only.

-- subscriptions ----------------------------------------------------------------

drop policy if exists "Users can create their own subscription" on public.subscriptions;
drop policy if exists "Users can update their own subscription" on public.subscriptions;

create policy "Admins can manage subscriptions"
  on public.subscriptions
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- trial_usage -------------------------------------------------------------------

drop policy if exists "Users can start their own trial" on public.trial_usage;
drop policy if exists "Users can update their own trial usage" on public.trial_usage;

create policy "Admins can manage trial usage"
  on public.trial_usage
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- feature_access ----------------------------------------------------------------

drop policy if exists "Users can manage their own feature access" on public.feature_access;
drop policy if exists "Users can update their own feature access" on public.feature_access;

create policy "Admins can manage feature access"
  on public.feature_access
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- subscription_history ----------------------------------------------------------

drop policy if exists "Users can insert their own subscription history" on public.subscription_history;

create policy "Admins can insert subscription history"
  on public.subscription_history
  for insert
  with check (public.is_admin());

-- owner analytics RPCs ----------------------------------------------------------

create or replace function public.require_admin()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'permission denied'
      using errcode = '42501';
  end if;
end;
$$;

comment on function public.require_admin() is
  'Raises permission denied unless the caller is an admin or owner.';

create or replace function public.owner_monthly_signups(months integer default 6)
returns table (month_label text, signup_count bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.require_admin();
  return query
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
end;
$$;

create or replace function public.owner_active_user_counts()
returns table (daily_active bigint, weekly_active bigint, monthly_active bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.require_admin();
  return query
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
end;
$$;

create or replace function public.owner_top_countries(result_limit integer default 8)
returns table (country text, user_count bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.require_admin();
  return query
  select coalesce(nullif(trim(p.country), ''), 'Unknown') as country, count(*)::bigint as user_count
  from public.profiles p
  where p.suspended_at is null
  group by 1
  order by user_count desc, country asc
  limit result_limit;
end;
$$;

create or replace function public.owner_preferred_brew_methods(result_limit integer default 8)
returns table (method_name text, user_count bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.require_admin();
  return query
  select bm.name as method_name, count(*)::bigint as user_count
  from public.profiles p
  join public.brewing_methods bm on bm.id = p.favorite_brewing_method_id
  where p.suspended_at is null
  group by bm.name
  order by user_count desc, method_name asc
  limit result_limit;
end;
$$;

create or replace function public.owner_preferred_devices(result_limit integer default 8)
returns table (device_name text, user_count bigint)
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.require_admin();
  return query
  select d.name as device_name, count(*)::bigint as user_count
  from public.profiles p
  join public.devices d on d.id = p.favorite_device_id
  where p.suspended_at is null
  group by d.name
  order by user_count desc, device_name asc
  limit result_limit;
end;
$$;

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
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  perform public.require_admin();
  return query
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
end;
$$;

grant execute on function public.require_admin() to authenticated;
grant execute on function public.owner_monthly_signups(integer) to authenticated;
grant execute on function public.owner_active_user_counts() to authenticated;
grant execute on function public.owner_top_countries(integer) to authenticated;
grant execute on function public.owner_preferred_brew_methods(integer) to authenticated;
grant execute on function public.owner_preferred_devices(integer) to authenticated;
grant execute on function public.owner_recipe_leaderboard(integer) to authenticated;
