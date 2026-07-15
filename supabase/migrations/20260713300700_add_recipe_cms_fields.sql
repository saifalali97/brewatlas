-- Phase 21.2: Recipe CMS — SEO fields and revision snapshots.

alter table public.recipes
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text;

comment on column public.recipes.seo_title is 'Optional override for page <title> and Open Graph title.';
comment on column public.recipes.seo_description is 'Optional override for meta description and Open Graph description.';
comment on column public.recipes.canonical_url is 'Optional canonical URL override for this recipe page.';

create table if not exists public.recipe_versions (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  version_number integer not null check (version_number > 0),
  snapshot jsonb not null default '{}'::jsonb,
  editor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint recipe_versions_recipe_version_key unique (recipe_id, version_number)
);

comment on table public.recipe_versions is
  'Append-only revision snapshots of a recipe, captured on owner CMS saves.';

create index if not exists recipe_versions_recipe_id_idx
  on public.recipe_versions (recipe_id, version_number desc);

alter table public.recipe_versions enable row level security;

create policy "Admins can manage recipe versions"
  on public.recipe_versions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Owners can manage recipe versions"
  on public.recipe_versions for all
  using (public.is_owner())
  with check (public.is_owner());
