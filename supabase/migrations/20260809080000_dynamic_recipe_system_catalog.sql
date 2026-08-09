-- Dynamic Recipe System: coffee catalog fields + user custom recipe settings.
-- Additive — does not break existing recipes/coffees schema.

alter table public.coffees
  add column if not exists slug text,
  add column if not exists region text,
  add column if not exists flavor_notes text[] not null default '{}',
  add column if not exists product_url text,
  add column if not exists product_image_url text,
  add column if not exists weight_options_grams integer[],
  add column if not exists available boolean not null default true,
  add column if not exists published boolean not null default true,
  add column if not exists recommended_methods text[] not null default '{}';

comment on column public.coffees.slug is
  'Stable coffee slug within a roaster catalog (unique with roaster_id when set).';
comment on column public.coffees.region is
  'Origin region when published by the roaster.';
comment on column public.coffees.flavor_notes is
  'Public tasting notes from the roaster product page.';
comment on column public.coffees.product_url is
  'Canonical retail product URL.';
comment on column public.coffees.product_image_url is
  'Product image URL when available.';
comment on column public.coffees.weight_options_grams is
  'Retail bag weights in grams (e.g. 200, 250).';
comment on column public.coffees.available is
  'In-stock / currently sold flag from last catalog sync.';
comment on column public.coffees.published is
  'Soft visibility flag — unpublished coffees are hidden without delete.';
comment on column public.coffees.recommended_methods is
  'Suggested brew methods for the Dynamic Recipe System.';

create unique index if not exists coffees_roaster_slug_uidx
  on public.coffees (roaster_id, slug)
  where roaster_id is not null and slug is not null;

create index if not exists coffees_published_available_idx
  on public.coffees (published, available);

-- Persisted personal / shared recipe settings without mutating official recipes.
create table if not exists public.user_custom_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  base_recipe_id uuid references public.recipes (id) on delete set null,
  base_recipe_slug text not null,
  title text,
  serving_style text check (serving_style in ('hot', 'iced')),
  brew_method text,
  coffee_dose_g numeric,
  brew_ratio numeric,
  settings jsonb not null default '{}'::jsonb,
  is_duplicate boolean not null default false,
  share_token text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_custom_recipes is
  'User-personalized Dynamic Recipe System settings derived from an official recipe.';

create index if not exists user_custom_recipes_user_id_idx
  on public.user_custom_recipes (user_id);
create index if not exists user_custom_recipes_base_slug_idx
  on public.user_custom_recipes (base_recipe_slug);

alter table public.user_custom_recipes enable row level security;

create policy "Users can view their custom recipes"
  on public.user_custom_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert their custom recipes"
  on public.user_custom_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their custom recipes"
  on public.user_custom_recipes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their custom recipes"
  on public.user_custom_recipes for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all custom recipes"
  on public.user_custom_recipes for all
  using (public.is_admin())
  with check (public.is_admin());
