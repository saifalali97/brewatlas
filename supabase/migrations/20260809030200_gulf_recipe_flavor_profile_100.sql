-- Gulf recipe flavor wheel uses a 0–100 scale. Existing recipes.sweetness /
-- acidity / body / bitterness columns remain 1–10 for the shared recipe form
-- and personalization features. Store the UI-exact 0–100 values separately.

alter table public.recipes
  add column if not exists flavor_sweetness integer
    check (flavor_sweetness is null or flavor_sweetness between 0 and 100),
  add column if not exists flavor_acidity integer
    check (flavor_acidity is null or flavor_acidity between 0 and 100),
  add column if not exists flavor_body integer
    check (flavor_body is null or flavor_body between 0 and 100),
  add column if not exists flavor_bitterness integer
    check (flavor_bitterness is null or flavor_bitterness between 0 and 100);

alter table public.recipes
  drop constraint if exists recipes_flavor_finish_check;

alter table public.recipes
  add constraint recipes_flavor_finish_check
  check (flavor_finish is null or flavor_finish between 0 and 100);

comment on column public.recipes.flavor_sweetness is
  '0–100 sweetness intensity for the Gulf flavor wheel / CMS display.';
comment on column public.recipes.flavor_acidity is
  '0–100 acidity intensity for the Gulf flavor wheel / CMS display.';
comment on column public.recipes.flavor_body is
  '0–100 body intensity for the Gulf flavor wheel / CMS display.';
comment on column public.recipes.flavor_bitterness is
  '0–100 bitterness intensity for the Gulf flavor wheel / CMS display.';
