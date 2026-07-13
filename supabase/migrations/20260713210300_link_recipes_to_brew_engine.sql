-- Links recipes to the Smart Brewing Engine tables. Each recipe may
-- reference one structured brew profile and one specific brew device
-- model, independent of (and additive to) the existing free-form brewing
-- fields and the general `devices` lookup already on `recipes`.

alter table public.recipes
  add column brew_profile_id uuid references public.brew_profiles (id) on delete set null,
  add column brew_device_id uuid references public.brew_devices (id) on delete set null;

comment on column public.recipes.brew_profile_id is
  'Optional structured Smart Brewing Engine profile for this recipe.';
comment on column public.recipes.brew_device_id is
  'Optional specific Smart Brewing Engine device model for this recipe.';

create index recipes_brew_profile_id_idx on public.recipes (brew_profile_id);
create index recipes_brew_device_id_idx on public.recipes (brew_device_id);
