-- recipes: the core content table. References the four lookup tables plus
-- the authoring profile. Lookup references use ON DELETE SET NULL so a
-- recipe survives cleanup of a brewing method/device/origin/roaster or the
-- departure of its author; only genuinely dependent rows (favorites) cascade.

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  brewing_method_id uuid references public.brewing_methods (id) on delete set null,
  device_id uuid references public.devices (id) on delete set null,
  origin_id uuid references public.origins (id) on delete set null,
  roaster_id uuid references public.roasters (id) on delete set null,
  author_id uuid references public.profiles (id) on delete set null,
  coffee_dose numeric(6, 2),
  water numeric(6, 2),
  ice numeric(6, 2),
  grind_size text,
  temperature numeric(5, 2),
  bloom text,
  brew_time text,
  pours jsonb not null default '[]'::jsonb,
  tasting_notes text,
  instructions text,
  image_url text,
  featured boolean not null default false,
  premium_only boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipes_slug_key unique (slug)
);

comment on table public.recipes is
  'Coffee brewing recipes; draft (published = false) or live content.';
comment on column public.recipes.pours is
  'Ordered pour steps, e.g. [{"at": "0:30", "water": 60}, ...].';

create index recipes_brewing_method_id_idx on public.recipes (brewing_method_id);
create index recipes_device_id_idx on public.recipes (device_id);
create index recipes_origin_id_idx on public.recipes (origin_id);
create index recipes_roaster_id_idx on public.recipes (roaster_id);
create index recipes_author_id_idx on public.recipes (author_id);
create index recipes_published_idx on public.recipes (published);
create index recipes_featured_idx on public.recipes (featured) where featured = true;

create trigger recipes_set_updated_at
  before update on public.recipes
  for each row
  execute function public.set_updated_at();

alter table public.recipes enable row level security;

-- Anyone (including anonymous visitors) can read published recipes.
create policy "Published recipes are viewable by everyone"
  on public.recipes
  for select
  using (published = true);

-- Authors have full control over their own recipes, published or draft.
create policy "Authors can manage their own recipes"
  on public.recipes
  for all
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Admins have full control over every recipe regardless of ownership or
-- publish state.
create policy "Admins can manage all recipes"
  on public.recipes
  for all
  using (public.is_admin())
  with check (public.is_admin());
