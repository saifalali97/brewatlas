-- BrewAtlas Discover Engine: extend published recipe search for Gulf library
-- fields (directory country/city, bean origin, variety, recipe roast/process)
-- and verified-roaster filtering. Keeps existing param names for app compatibility.

drop function if exists public.search_published_recipes(
  text, uuid, uuid, uuid, text, text, text, uuid, uuid, text, text, uuid, text,
  integer, numeric, numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, text, text, boolean, text, text, integer, integer
);

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
  p_recipe_kind text default null,
  p_verification_status text default null,
  p_verified_only boolean default false,
  p_serving_style text default null,
  p_sort text default 'newest',
  p_limit integer default 12,
  p_offset integer default 0,
  p_city_id uuid default null,
  p_bean_origin text default null
)
returns table (recipe_id uuid, total_count bigint)
language plpgsql
volatile
security invoker
set search_path = public
as $$
declare
  v_total bigint;
  v_q text := nullif(btrim(coalesce(p_q, '')), '');
begin
  create temp table _recipe_search on commit drop as
  select distinct
    r.id,
    r.title,
    r.created_at,
    r.recipe_kind,
    r.verification_status,
    r.featured,
    r.serving_style,
    coalesce(
      r.brew_time_minutes,
      case
        when r.estimated_brew_time ~ '^[0-9]{1,2}:[0-9]{2}'
          then greatest(1, split_part(r.estimated_brew_time, ':', 1)::integer)
        else null
      end,
      999999
    ) as brew_minutes,
    coalesce(rs.average_rating, r.rating, 0)::numeric as avg_rating,
    coalesce(fc.favorite_count, 0)::bigint as favorite_count,
    case
      when r.recipe_kind = 'official' and r.verification_status in ('verified', 'competition_tested') then 1
      else 0
    end as official_rank
  from public.recipes r
  left join public.coffees c on c.id = r.coffee_id
  left join public.origins o on o.id = c.origin_id
  left join public.roasters rost on rost.id = coalesce(r.roaster_id, c.roaster_id)
  left join public.countries dc on dc.id = coalesce(r.country_id, rost.country_id)
  left join public.cities ci on ci.id = coalesce(r.city_id, rost.city_id)
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
    and (
      p_country is null or btrim(p_country) = ''
      or o.country = p_country
      or dc.slug = p_country
      or dc.name ilike p_country
      or rost.country ilike p_country
    )
    and (
      p_region is null or btrim(p_region) = ''
      or o.region ilike ('%' || p_region || '%')
      or r.bean_origin ilike ('%' || p_region || '%')
    )
    and (p_origin_id is null or c.origin_id = p_origin_id)
    and (
      p_bean_origin is null or btrim(p_bean_origin) = ''
      or r.bean_origin ilike p_bean_origin
      or (
        o.region is not null
        and o.country is not null
        and (o.region || ', ' || o.country) ilike p_bean_origin
      )
    )
    and (p_city_id is null or r.city_id = p_city_id or rost.city_id = p_city_id or ci.id = p_city_id)
    and (
      p_roaster_id is null
      or r.roaster_id = p_roaster_id
      or c.roaster_id = p_roaster_id
    )
    and (
      p_roast_level is null
      or c.roast_level = p_roast_level
      or r.roast_level = p_roast_level
    )
    and (
      p_process is null
      or c.process = p_process
      or r.process = p_process
      or r.process ilike (p_process || '%')
    )
    and (p_serving_style is null or r.serving_style::text = p_serving_style)
    and (
      p_brew_time_max is null
      or coalesce(
        r.brew_time_minutes,
        case
          when r.estimated_brew_time ~ '^[0-9]{1,2}:[0-9]{2}'
            then greatest(1, split_part(r.estimated_brew_time, ':', 1)::integer)
          else null
        end,
        999999
      ) <= p_brew_time_max
    )
    and (p_dose_min is null or r.coffee_dose >= p_dose_min)
    and (p_dose_max is null or r.coffee_dose <= p_dose_max)
    and (p_water_min is null or r.water_amount >= p_water_min)
    and (p_water_max is null or r.water_amount <= p_water_max)
    and (p_temp_min is null or r.water_temperature >= p_temp_min)
    and (p_temp_max is null or r.water_temperature <= p_temp_max)
    and (not p_premium_only or r.premium_only = true)
    and (not p_featured_only or r.featured = true)
    and (p_recipe_kind is null or r.recipe_kind::text = p_recipe_kind)
    and (p_verification_status is null or r.verification_status::text = p_verification_status)
    and (
      not p_verified_only
      or rost.verified = true
    )
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
      v_q is null
      or r.title ilike ('%' || v_q || '%')
      or r.description ilike ('%' || v_q || '%')
      or r.tasting_notes ilike ('%' || v_q || '%')
      or r.coffee_beans ilike ('%' || v_q || '%')
      or r.bean_origin ilike ('%' || v_q || '%')
      or r.variety ilike ('%' || v_q || '%')
      or r.process ilike ('%' || v_q || '%')
      or r.roast_level ilike ('%' || v_q || '%')
      or r.brew_method ilike ('%' || v_q || '%')
      or r.producer ilike ('%' || v_q || '%')
      or rost.name ilike ('%' || v_q || '%')
      or rost.city ilike ('%' || v_q || '%')
      or rost.country ilike ('%' || v_q || '%')
      or dc.name ilike ('%' || v_q || '%')
      or dc.slug ilike ('%' || v_q || '%')
      or ci.name ilike ('%' || v_q || '%')
      or exists (
        select 1
        from public.recipe_tags rt
        join public.tags t on t.id = rt.tag_id
        where rt.recipe_id = r.id and t.name ilike ('%' || v_q || '%')
      )
      or exists (
        select 1
        from public.recipe_flavor_notes fn
        where fn.recipe_id = r.id and fn.note ilike ('%' || v_q || '%')
      )
      or exists (
        select 1 from public.coffees cx
        where cx.id = r.coffee_id
          and (
            cx.name ilike ('%' || v_q || '%')
            or cx.variety ilike ('%' || v_q || '%')
            or cx.process ilike ('%' || v_q || '%')
          )
      )
    );

  select count(*) into v_total from _recipe_search;

  return query
  select s.id as recipe_id, v_total as total_count
  from _recipe_search s
  order by
    case when p_sort = 'official' then s.official_rank end desc nulls last,
    case when p_sort = 'alphabetical' then s.title end asc nulls last,
    case when p_sort = 'newest' then s.created_at end desc nulls last,
    case when p_sort = 'fastest' then s.brew_minutes end asc nulls last,
    case when p_sort = 'rated' then s.avg_rating end desc nulls last,
    case when p_sort = 'popular' then s.favorite_count end desc nulls last,
    s.official_rank desc,
    s.created_at desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
end;
$$;

comment on function public.search_published_recipes(
  text, uuid, uuid, uuid, text, text, text, uuid, uuid, text, text, uuid, text,
  integer, numeric, numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, text, text, boolean, text, text, integer, integer, uuid, text
) is
  'Discover Engine: server-side filtered/sorted/paginated published recipe search including Gulf directory fields.';

grant execute on function public.search_published_recipes(
  text, uuid, uuid, uuid, text, text, text, uuid, uuid, text, text, uuid, text,
  integer, numeric, numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, text, text, boolean, text, text, integer, integer, uuid, text
) to anon, authenticated;

-- Helpful indexes for Discover text filters on Gulf columns.
create index if not exists recipes_bean_origin_trgm_idx
  on public.recipes using gin (bean_origin gin_trgm_ops)
  where bean_origin is not null;

create index if not exists recipes_variety_trgm_idx
  on public.recipes using gin (variety gin_trgm_ops)
  where variety is not null;

create index if not exists recipes_roast_level_idx
  on public.recipes (roast_level)
  where roast_level is not null;

create index if not exists recipes_process_idx
  on public.recipes (process)
  where process is not null;
