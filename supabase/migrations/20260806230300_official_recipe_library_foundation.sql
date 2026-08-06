-- Official BrewAtlas Recipe Library foundation.
-- Extends the existing recipes model with roastery linkage, hot/iced serving,
-- source verification, agitation/drawdown fields, richer pour steps, and
-- i18n — without seeding recipe content.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.recipe_serving_style as enum ('hot', 'iced');

create type public.recipe_source_verification_status as enum (
  'unverified',
  'pending',
  'verified',
  'rejected'
);

comment on type public.recipe_serving_style is
  'Whether the recipe is brewed and served hot or over ice.';
comment on type public.recipe_source_verification_status is
  'Editorial verification state for the external source_url, separate from BrewAtlas verification_status.';

-- ---------------------------------------------------------------------------
-- recipes: official library fields
-- ---------------------------------------------------------------------------

alter table public.recipes
  add column if not exists roaster_id uuid references public.roasters (id) on delete set null,
  add column if not exists serving_style public.recipe_serving_style not null default 'hot',
  add column if not exists grinder_setting text,
  add column if not exists agitation_instructions text,
  add column if not exists drawdown_target text,
  add column if not exists source_url text,
  add column if not exists source_verification_status public.recipe_source_verification_status not null default 'unverified',
  add column if not exists source_verified_at timestamptz,
  add column if not exists source_verified_by uuid references public.profiles (id) on delete set null,
  add column if not exists recipe_author_name text;

comment on column public.recipes.roaster_id is
  'Direct roastery link for the official recipe library. Auto-synced from coffees.roaster_id when coffee_id is set.';
comment on column public.recipes.serving_style is
  'Hot or iced service style. Every official brewing method supports both variants.';
comment on column public.recipes.grinder_setting is
  'Machine-specific grinder dial setting (e.g. "28 clicks"), complementing grind_size.';
comment on column public.recipes.agitation_instructions is
  'Swirl, stir, or other agitation guidance for the full brew.';
comment on column public.recipes.drawdown_target is
  'Target drawdown window or finish time (e.g. "2:30–3:00").';
comment on column public.recipes.source_url is
  'External reference URL for the original published recipe or roaster source.';
comment on column public.recipes.source_verification_status is
  'Verification of source_url by BrewAtlas editors, independent of verification_status.';
comment on column public.recipes.recipe_author_name is
  'Credited recipe author display name (roaster staff, guest barista, etc.).';

create index if not exists recipes_roaster_id_idx on public.recipes (roaster_id);
create index if not exists recipes_serving_style_idx on public.recipes (serving_style);
create index if not exists recipes_official_roaster_idx
  on public.recipes (roaster_id, serving_style, brewing_method_id)
  where recipe_kind = 'official' and status = 'published';

-- Backfill roaster_id and serving_style from existing data.
update public.recipes r
set roaster_id = c.roaster_id
from public.coffees c
where r.coffee_id = c.id
  and r.roaster_id is null
  and c.roaster_id is not null;

update public.recipes
set serving_style = 'iced'
where serving_style = 'hot'
  and ice_amount is not null
  and ice_amount > 0;

-- Keep roaster_id aligned with the linked coffee lot.
create or replace function public.recipes_sync_roaster_from_coffee()
returns trigger
language plpgsql
as $$
declare
  v_coffee_roaster_id uuid;
begin
  if new.coffee_id is not null then
    select c.roaster_id
    into v_coffee_roaster_id
    from public.coffees c
    where c.id = new.coffee_id;

    if v_coffee_roaster_id is not null then
      if new.roaster_id is null then
        new.roaster_id := v_coffee_roaster_id;
      elsif new.roaster_id is distinct from v_coffee_roaster_id then
        raise exception 'recipes.roaster_id must match coffees.roaster_id when coffee_id is set';
      end if;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists recipes_sync_roaster_from_coffee on public.recipes;
create trigger recipes_sync_roaster_from_coffee
  before insert or update of coffee_id, roaster_id on public.recipes
  for each row
  execute function public.recipes_sync_roaster_from_coffee();

-- ---------------------------------------------------------------------------
-- recipe_pours: richer unlimited pour structure
-- ---------------------------------------------------------------------------

alter table public.recipe_pours
  add column if not exists duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  add column if not exists agitation text,
  add column if not exists pour_target text;

comment on column public.recipe_pours.duration_seconds is
  'Optional numeric duration for this pour step, in seconds.';
comment on column public.recipe_pours.agitation is
  'Agitation guidance specific to this pour step.';
comment on column public.recipe_pours.pour_target is
  'Bed level or visual target for this pour (e.g. "half bed", "spiral center").';

-- ---------------------------------------------------------------------------
-- i18n: translatable official library fields
-- ---------------------------------------------------------------------------

alter table public.recipe_translations
  add column if not exists agitation_instructions text,
  add column if not exists drawdown_target text;

comment on column public.recipe_translations.agitation_instructions is
  'Localized agitation_instructions for the recipe.';
comment on column public.recipe_translations.drawdown_target is
  'Localized drawdown_target for the recipe.';

create table if not exists public.recipe_pour_translations (
  pour_id uuid not null references public.recipe_pours (id) on delete cascade,
  locale text not null check (locale in ('en', 'ar')),
  notes text,
  agitation text,
  pour_target text,
  is_machine_translated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (pour_id, locale)
);

comment on table public.recipe_pour_translations is
  'Per-locale translated copy for recipe pour steps (notes, agitation, pour_target).';

create index if not exists recipe_pour_translations_locale_idx
  on public.recipe_pour_translations (locale);

create trigger recipe_pour_translations_set_updated_at
  before update on public.recipe_pour_translations
  for each row
  execute function public.set_updated_at();

alter table public.recipe_pour_translations enable row level security;

create policy "Pour translations are viewable when the pour recipe is"
  on public.recipe_pour_translations for select
  using (
    exists (
      select 1
      from public.recipe_pours rp
      join public.recipes r on r.id = rp.recipe_id
      where rp.id = recipe_pour_translations.pour_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage translations of their own recipe pours"
  on public.recipe_pour_translations for all
  using (
    exists (
      select 1
      from public.recipe_pours rp
      join public.recipes r on r.id = rp.recipe_id
      where rp.id = recipe_pour_translations.pour_id
        and r.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.recipe_pours rp
      join public.recipes r on r.id = rp.recipe_id
      where rp.id = recipe_pour_translations.pour_id
        and r.author_id = auth.uid()
    )
  );

create policy "Admins can manage all pour translations"
  on public.recipe_pour_translations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Official brewing method catalog (idempotent; no recipe seeds)
-- ---------------------------------------------------------------------------

insert into public.brewing_methods (name, slug, description, icon) values
  ('Origami', 'origami', 'Flat-bottom or cone brewing with origami folds for controlled flow.', 'droplet'),
  ('Orea', 'orea', 'Flat-bottom specialty dripper with precise flow control.', 'droplet'),
  ('Kalita', 'kalita', 'Wave-shaped flat-bottom pour-over for even extraction.', 'droplet'),
  ('xBloom', 'xbloom', 'Automated precision brewing with programmable pulse profiles.', 'cpu'),
  ('Batch Brew', 'batch-brew', 'Multi-cup filter batch brewing for café service.', 'coffee')
on conflict (slug) do nothing;

comment on table public.brewing_methods is
  'Reference brewing methods for the official recipe library, including V60, Chemex, AeroPress, Espresso, Cold Brew, xBloom, and Batch Brew.';

-- ---------------------------------------------------------------------------
-- search_published_recipes: serving_style + direct roaster_id filters
-- ---------------------------------------------------------------------------

drop function if exists public.search_published_recipes(
  text, uuid, uuid, uuid, text, text, text, uuid, uuid, text, text, uuid, text,
  integer, numeric, numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, text, text, boolean, text, integer, integer
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
    r.serving_style,
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
    and (
      p_roaster_id is null
      or r.roaster_id = p_roaster_id
      or c.roaster_id = p_roaster_id
    )
    and (p_roast_level is null or c.roast_level = p_roast_level)
    and (p_process is null or c.process = p_process)
    and (p_serving_style is null or r.serving_style::text = p_serving_style)
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
  boolean, boolean, text, text, boolean, text, text, integer, integer
) is
  'Server-side filtered, sorted, and paginated published recipe search with official library and serving_style filters.';

grant execute on function public.search_published_recipes(
  text, uuid, uuid, uuid, text, text, text, uuid, uuid, text, text, uuid, text,
  integer, numeric, numeric, numeric, numeric, numeric, numeric,
  boolean, boolean, text, text, boolean, text, text, integer, integer
) to anon, authenticated;
