-- Recipe Personalization Engine — per-recipe policy columns.
-- Additive defaults keep all existing recipes valid without migration of content.

alter table public.recipes
  add column if not exists personalization_enabled boolean not null default true,
  add column if not exists personalization_hot_supported boolean not null default true,
  add column if not exists personalization_iced_supported boolean not null default true,
  add column if not exists personalization_iced_water_percentage numeric not null default 50
    check (
      personalization_iced_water_percentage >= 0
      and personalization_iced_water_percentage <= 100
    ),
  add column if not exists personalization_dose_scalable boolean not null default true,
  add column if not exists personalization_ratio_scalable boolean not null default true,
  add column if not exists personalization_pours_scalable boolean not null default true;

comment on column public.recipes.personalization_enabled is
  'When false, recipe detail hides Customize your brew controls.';
comment on column public.recipes.personalization_hot_supported is
  'Whether Hot brew style is offered in personalization.';
comment on column public.recipes.personalization_iced_supported is
  'Whether Iced / flash brew style is offered in personalization.';
comment on column public.recipes.personalization_iced_water_percentage is
  'Percent of total brew water that becomes ice in iced mode (0–100).';
comment on column public.recipes.personalization_dose_scalable is
  'Whether users may change coffee dose.';
comment on column public.recipes.personalization_ratio_scalable is
  'Whether users may change brew ratio.';
comment on column public.recipes.personalization_pours_scalable is
  'Whether pour amounts scale with total water.';

-- Ensure user customizations store preferences only (already created earlier).
comment on table public.user_custom_recipes is
  'User personalization preferences derived from an official recipe — never mutates recipes.';
