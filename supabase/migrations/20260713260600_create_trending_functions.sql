-- Trending: recipes, coffees, roasters, and brewing methods with the most
-- recent community activity (brews logged + likes given), over a caller-
-- supplied rolling window. All SECURITY DEFINER so they can read the
-- owner-only user_brew_logs table in aggregate (never exposing individual
-- rows) the same way public.recipe_favorites_count already does for
-- favorites. Callable directly as PostgREST RPCs, so a future mobile app
-- can use them exactly as-is.

create or replace function public.trending_recipes(days integer default 14, result_limit integer default 10)
returns table (
  recipe_id uuid,
  title text,
  slug text,
  cover_image_url text,
  brew_count bigint,
  like_count bigint,
  activity_count bigint
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
    r.cover_image_url,
    coalesce(b.brew_count, 0) as brew_count,
    coalesce(l.like_count, 0) as like_count,
    coalesce(b.brew_count, 0) + coalesce(l.like_count, 0) as activity_count
  from public.recipes r
  left join (
    select recipe_id, count(*) as brew_count
    from public.user_brew_logs
    where recipe_id is not null and brewed_at >= now() - (days || ' days')::interval
    group by recipe_id
  ) b on b.recipe_id = r.id
  left join (
    select recipe_id, count(*) as like_count
    from public.recipe_likes
    where created_at >= now() - (days || ' days')::interval
    group by recipe_id
  ) l on l.recipe_id = r.id
  where r.published = true
    and (coalesce(b.brew_count, 0) + coalesce(l.like_count, 0)) > 0
  order by activity_count desc, r.created_at desc
  limit result_limit;
$$;

comment on function public.trending_recipes(integer, integer) is
  'Recipes with the most brews + likes in the last `days` days.';

grant execute on function public.trending_recipes(integer, integer) to anon, authenticated;

create or replace function public.trending_coffees(days integer default 14, result_limit integer default 10)
returns table (
  coffee_id uuid,
  coffee_name text,
  roaster_name text,
  origin_country text,
  activity_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    c.id as coffee_id,
    c.name as coffee_name,
    ro.name as roaster_name,
    o.country as origin_country,
    count(*) as activity_count
  from public.user_brew_logs bl
  join public.recipes r on r.id = bl.recipe_id
  join public.coffees c on c.id = r.coffee_id
  left join public.roasters ro on ro.id = c.roaster_id
  left join public.origins o on o.id = c.origin_id
  where bl.brewed_at >= now() - (days || ' days')::interval
  group by c.id, c.name, ro.name, o.country
  order by activity_count desc
  limit result_limit;
$$;

comment on function public.trending_coffees(integer, integer) is
  'Coffees brewed the most in the last `days` days, based on user_brew_logs.';

grant execute on function public.trending_coffees(integer, integer) to anon, authenticated;

create or replace function public.trending_roasters(days integer default 14, result_limit integer default 10)
returns table (
  roaster_id uuid,
  roaster_name text,
  activity_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    ro.id as roaster_id,
    ro.name as roaster_name,
    count(*) as activity_count
  from public.user_brew_logs bl
  join public.recipes r on r.id = bl.recipe_id
  join public.coffees c on c.id = r.coffee_id
  join public.roasters ro on ro.id = c.roaster_id
  where bl.brewed_at >= now() - (days || ' days')::interval
  group by ro.id, ro.name
  order by activity_count desc
  limit result_limit;
$$;

comment on function public.trending_roasters(integer, integer) is
  'Roasters whose coffees were brewed the most in the last `days` days.';

grant execute on function public.trending_roasters(integer, integer) to anon, authenticated;

create or replace function public.trending_brewing_methods(days integer default 14, result_limit integer default 10)
returns table (
  brewing_method_id uuid,
  method_name text,
  activity_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    bm.id as brewing_method_id,
    bm.name as method_name,
    count(*) as activity_count
  from public.user_brew_logs bl
  join public.brewing_methods bm on bm.id = bl.brewing_method_id
  where bl.brewed_at >= now() - (days || ' days')::interval
  group by bm.id, bm.name
  order by activity_count desc
  limit result_limit;
$$;

comment on function public.trending_brewing_methods(integer, integer) is
  'Brewing methods used the most in the last `days` days, based on user_brew_logs.';

grant execute on function public.trending_brewing_methods(integer, integer) to anon, authenticated;
