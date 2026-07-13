-- Expands `recipes` into a full professional recipe model: general info,
-- a link to a specific coffee lot, complete brewing parameters, structured
-- results/cupping scores, and richer media. The table is still empty in
-- every environment this has shipped to, so renames/drops here are safe.

-- Origin/roaster are now reached through `coffees` (coffee_id) instead of
-- being duplicated directly on the recipe.
drop index if exists public.recipes_origin_id_idx;
drop index if exists public.recipes_roaster_id_idx;

alter table public.recipes
  drop column origin_id,
  drop column roaster_id,
  -- Superseded by the explicit bloom_amount/bloom_time columns added below.
  drop column bloom,
  -- Superseded by the explicit estimated_brew_time/total_brew_time columns.
  drop column brew_time,
  -- Superseded by the normalized recipe_pours table.
  drop column pours;

alter table public.recipes rename column water to water_amount;
alter table public.recipes rename column ice to ice_amount;
alter table public.recipes rename column temperature to water_temperature;
alter table public.recipes rename column image_url to cover_image_url;

alter table public.recipes
  add column description text,
  add column video_url text,
  add column difficulty text check (difficulty in ('Beginner', 'Intermediate', 'Advanced')),
  add column estimated_brew_time text,
  add column coffee_id uuid references public.coffees (id) on delete set null,
  add column grinder_id uuid references public.grinders (id) on delete set null,
  add column filter_type_id uuid references public.filter_types (id) on delete set null,
  add column water_profile_id uuid references public.water_profiles (id) on delete set null,
  add column ratio text,
  add column bloom_amount numeric(6, 2),
  add column bloom_time text,
  add column total_brew_time text,
  add column beverage_weight numeric(6, 2),
  add column tds numeric(4, 2),
  add column extraction_percentage numeric(5, 2),
  add column sweetness smallint check (sweetness between 1 and 10),
  add column acidity smallint check (acidity between 1 and 10),
  add column body smallint check (body between 1 and 10),
  add column bitterness smallint check (bitterness between 1 and 10);

comment on column public.recipes.coffee_id is 'The specific roasted coffee lot this recipe uses.';
comment on column public.recipes.ratio is 'Brew ratio as entered by the author, e.g. "1:16".';
comment on column public.recipes.tasting_notes is 'Free-text flavor notes (the Results section "Flavor notes" field).';
comment on column public.recipes.estimated_brew_time is 'Planned/expected brew time shown before brewing (General section).';
comment on column public.recipes.total_brew_time is 'Actual total brew time achieved (Results section).';

create index recipes_coffee_id_idx on public.recipes (coffee_id);
create index recipes_grinder_id_idx on public.recipes (grinder_id);
create index recipes_filter_type_id_idx on public.recipes (filter_type_id);
create index recipes_water_profile_id_idx on public.recipes (water_profile_id);
create index recipes_difficulty_idx on public.recipes (difficulty);
