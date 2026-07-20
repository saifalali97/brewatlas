-- Official Recipe Library: recipe classification, verification, editorial content, and search.

create type public.recipe_kind as enum (
  'official',
  'community',
  'imported',
  'competition',
  'archived'
);

create type public.recipe_verification_status as enum (
  'draft',
  'testing',
  'verified',
  'competition_tested',
  'archived'
);

alter table public.recipes
  add column if not exists recipe_kind public.recipe_kind not null default 'community',
  add column if not exists verification_status public.recipe_verification_status not null default 'draft',
  add column if not exists version_label text not null default '1.0',
  add column if not exists recipe_science text,
  add column if not exists why_it_works text,
  add column if not exists common_mistakes text,
  add column if not exists adjustments text,
  add column if not exists faq jsonb not null default '[]'::jsonb,
  add column if not exists pour_structure text,
  add column if not exists finish_notes text,
  add column if not exists grinder_recommendation text,
  add column if not exists water_recommendation text,
  add column if not exists equipment_notes text,
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references public.profiles (id) on delete set null;

comment on column public.recipes.recipe_kind is
  'Library classification: official (curated), community (user), imported, competition, archived.';
comment on column public.recipes.verification_status is
  'Editorial verification state for official and competition recipes.';
comment on column public.recipes.version_label is
  'Human-readable version label shown on official recipes (e.g. 1.0, 2.1).';
comment on column public.recipes.faq is
  'Array of { question, answer } objects for official recipe FAQ sections.';

-- Platform seed recipes become the initial official library.
update public.recipes
set
  recipe_kind = 'official',
  verification_status = 'verified',
  version_label = coalesce(nullif(version_label, ''), '1.0')
where author_id is null;

alter table public.recipe_versions
  add column if not exists version_label text,
  add column if not exists change_reason text,
  add column if not exists brewing_changes text,
  add column if not exists version_author_id uuid references public.profiles (id) on delete set null;

comment on column public.recipe_versions.version_label is 'Semantic version label (e.g. 1.1) at time of snapshot.';
comment on column public.recipe_versions.change_reason is 'Why this version was created.';
comment on column public.recipe_versions.brewing_changes is 'Summary of brewing parameter or step changes.';

create index if not exists recipes_kind_status_idx
  on public.recipes (recipe_kind, status, updated_at desc);

create index if not exists recipes_official_verified_idx
  on public.recipes (verification_status, featured desc, updated_at desc)
  where recipe_kind = 'official' and status = 'published';

create index if not exists recipes_official_search_idx
  on public.recipes using gin (title gin_trgm_ops)
  where recipe_kind = 'official';

-- Extend published recipe search with official library filters.
drop function if exists public.search_published_recipes(
  text, uuid, uuid, uuid, text, text, text, uuid, uuid, text, text, uuid, text,
  integer, numeric, numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, text, integer, integer
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
  p_sort text default 'newest',
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (recipe_id uuid, total_count bigint)
language plpgsql
volatile
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
    r.recipe_kind,
    r.verification_status,
    r.featured,
    coalesce(r.brew_time_minutes, 999999) as brew_minutes,
    coalesce(rs.average_rating, 0)::numeric as avg_rating,
    coalesce(fc.favorite_count, 0)::bigint as favorite_count,
    case
      when r.recipe_kind = 'official' and r.verification_status in ('verified', 'competition_tested') then 1
      else 0
    end as official_rank
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
    and (p_recipe_kind is null or r.recipe_kind::text = p_recipe_kind)
    and (p_verification_status is null or r.verification_status::text = p_verification_status)
    and (
      not p_verified_only
      or r.verification_status in ('verified', 'competition_tested')
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
  boolean, boolean, text, text, boolean, text, integer, integer
) is
  'Server-side filtered, sorted, and paginated published recipe search with official library filters.';

grant execute on function public.search_published_recipes(
  text, uuid, uuid, uuid, text, text, text, uuid, uuid, text, text, uuid, text,
  integer, numeric, numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, text, text, boolean, text, integer, integer
) to anon, authenticated;
