-- Phase 21.6: Advanced recipe search — indexes, brew time normalization, and server-side search RPC.

create extension if not exists pg_trgm;

create or replace function public.parse_brew_time_minutes(time_text text)
returns integer
language plpgsql
immutable
as $$
declare
  colon_match text[];
  minute_match text[];
  digits integer;
begin
  if time_text is null or btrim(time_text) = '' then
    return null;
  end if;

  colon_match := regexp_match(time_text, '(\d+)\s*:\s*(\d+)');
  if colon_match is not null then
    return (colon_match[1]::integer * 60) + colon_match[2]::integer;
  end if;

  minute_match := regexp_match(time_text, '(\d+)\s*min', 'i');
  if minute_match is not null then
    return minute_match[1]::integer;
  end if;

  digits := nullif(regexp_replace(time_text, '[^0-9]', '', 'g'), '')::integer;
  return digits;
end;
$$;

alter table public.recipes
  add column if not exists brew_time_minutes integer;

update public.recipes
set brew_time_minutes = public.parse_brew_time_minutes(coalesce(total_brew_time, estimated_brew_time))
where brew_time_minutes is null;

create index if not exists recipes_status_created_at_idx
  on public.recipes (status, created_at desc);

create index if not exists recipes_status_title_idx
  on public.recipes (status, title);

create index if not exists recipes_brew_time_minutes_idx
  on public.recipes (brew_time_minutes);

create index if not exists recipes_status_brewing_method_idx
  on public.recipes (status, brewing_method_id);

create index if not exists recipes_status_device_idx
  on public.recipes (status, device_id);

create index if not exists recipes_status_grinder_idx
  on public.recipes (status, grinder_id);

create index if not exists recipes_status_difficulty_idx
  on public.recipes (status, difficulty);

create index if not exists coffees_process_idx on public.coffees (process);
create index if not exists coffees_roast_level_idx on public.coffees (roast_level);
create index if not exists coffees_origin_id_idx on public.coffees (origin_id);
create index if not exists coffees_roaster_id_idx on public.coffees (roaster_id);

create index if not exists recipes_title_trgm_idx
  on public.recipes using gin (title gin_trgm_ops);

create index if not exists recipes_tasting_notes_trgm_idx
  on public.recipes using gin (tasting_notes gin_trgm_ops);

create or replace function public.search_published_recipes(
  p_q text default null,
  p_brewing_method_id uuid default null,
  p_device_id uuid default null,
  p_grinder_id uuid default null,
  p_difficulty text default null,
  p_country text default null,
  p_region text default null,
  p_origin_id uuid default null,
  p_roaster_id uuid default null,
  p_roast_level text default null,
  p_process text default null,
  p_tag_id uuid default null,
  p_tasting_notes text default null,
  p_brew_time_max integer default null,
  p_dose_min numeric default null,
  p_dose_max numeric default null,
  p_water_min numeric default null,
  p_water_max numeric default null,
  p_temp_min numeric default null,
  p_temp_max numeric default null,
  p_premium_only boolean default false,
  p_featured_only boolean default false,
  p_sort text default 'newest',
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (recipe_id uuid, total_count bigint)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_total bigint;
begin
  create temp table _recipe_search on commit drop as
  select distinct
    r.id,
    r.title,
    r.created_at,
    coalesce(r.brew_time_minutes, 999999) as brew_minutes,
    coalesce(rs.average_rating, 0)::numeric as avg_rating,
    coalesce(fc.favorite_count, 0)::bigint as favorite_count
  from public.recipes r
  left join public.coffees c on c.id = r.coffee_id
  left join public.origins o on o.id = c.origin_id
  left join public.recipe_rating_summary rs on rs.recipe_id = r.id
  left join (
    select f.recipe_id, count(*)::bigint as favorite_count
    from public.favorites f
    group by f.recipe_id
  ) fc on fc.recipe_id = r.id
  where r.status = 'published'
    and (p_brewing_method_id is null or r.brewing_method_id = p_brewing_method_id)
    and (p_device_id is null or r.device_id = p_device_id)
    and (p_grinder_id is null or r.grinder_id = p_grinder_id)
    and (p_difficulty is null or r.difficulty::text = p_difficulty)
    and (p_country is null or o.country = p_country)
    and (p_region is null or o.region ilike ('%' || p_region || '%'))
    and (p_origin_id is null or c.origin_id = p_origin_id)
    and (p_roaster_id is null or c.roaster_id = p_roaster_id)
    and (p_roast_level is null or c.roast_level = p_roast_level)
    and (p_process is null or c.process = p_process)
    and (p_brew_time_max is null or coalesce(r.brew_time_minutes, 999999) <= p_brew_time_max)
    and (p_dose_min is null or r.coffee_dose >= p_dose_min)
    and (p_dose_max is null or r.coffee_dose <= p_dose_max)
    and (p_water_min is null or r.water_amount >= p_water_min)
    and (p_water_max is null or r.water_amount <= p_water_max)
    and (p_temp_min is null or r.water_temperature >= p_temp_min)
    and (p_temp_max is null or r.water_temperature <= p_temp_max)
    and (not p_premium_only or r.premium_only = true)
    and (not p_featured_only or r.featured = true)
    and (
      p_tag_id is null
      or exists (
        select 1 from public.recipe_tags rt
        where rt.recipe_id = r.id and rt.tag_id = p_tag_id
      )
    )
    and (
      p_tasting_notes is null or p_tasting_notes = ''
      or r.tasting_notes ilike ('%' || p_tasting_notes || '%')
    )
    and (
      p_q is null or btrim(p_q) = ''
      or r.title ilike ('%' || p_q || '%')
      or r.description ilike ('%' || p_q || '%')
      or r.tasting_notes ilike ('%' || p_q || '%')
      or exists (
        select 1
        from public.recipe_tags rt
        join public.tags t on t.id = rt.tag_id
        where rt.recipe_id = r.id and t.name ilike ('%' || p_q || '%')
      )
      or exists (
        select 1 from public.coffees cx
        where cx.id = r.coffee_id
          and (
            cx.name ilike ('%' || p_q || '%')
            or cx.variety ilike ('%' || p_q || '%')
            or cx.process ilike ('%' || p_q || '%')
          )
      )
    );

  select count(*) into v_total from _recipe_search;

  return query
  select s.id as recipe_id, v_total as total_count
  from _recipe_search s
  order by
    case when p_sort = 'alphabetical' then s.title end asc nulls last,
    case when p_sort = 'newest' then s.created_at end desc nulls last,
    case when p_sort = 'fastest' then s.brew_minutes end asc nulls last,
    case when p_sort = 'rated' then s.avg_rating end desc nulls last,
    case when p_sort = 'popular' then s.favorite_count end desc nulls last,
    s.created_at desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
end;
$$;

comment on function public.search_published_recipes is
  'Server-side filtered, sorted, and paginated published recipe search for BrewAtlas /search.';

grant execute on function public.search_published_recipes to anon, authenticated;
