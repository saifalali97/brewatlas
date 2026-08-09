-- Gulf Recipe Library schema: extend recipes for directory geo + CMS-ready
-- child tables that mirror PlaceholderRecipeDetail without UI changes.

-- ---------------------------------------------------------------------------
-- brewing_methods: ensure Gulf methods exist
-- ---------------------------------------------------------------------------

insert into public.brewing_methods (name, slug, description, icon) values
  ('V60', 'v60', 'Hario V60 cone pour-over for clear, bright cups.', 'droplet'),
  ('Chemex', 'chemex', 'Hourglass pour-over with thick bonded filters.', 'droplet'),
  ('Aeropress', 'aeropress', 'Immersion/pressure hybrid brewer for versatile cups.', 'droplet'),
  ('Espresso', 'espresso', 'Pressurized short extraction for concentrated coffee.', 'coffee'),
  ('Cold Brew', 'cold-brew', 'Long cold immersion for low-acid concentrate.', 'droplet'),
  ('French Press', 'french-press', 'Full-immersion metal-filter brewing.', 'coffee'),
  ('Origami', 'origami', 'Flat-bottom or cone brewing with origami folds for controlled flow.', 'droplet'),
  ('Kalita', 'kalita', 'Wave-shaped flat-bottom pour-over for even extraction.', 'droplet')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- recipes: Gulf directory + display fields
-- ---------------------------------------------------------------------------

alter table public.recipes
  add column if not exists country_id uuid references public.countries (id) on delete set null,
  add column if not exists city_id uuid references public.cities (id) on delete set null,
  add column if not exists brew_method text,
  add column if not exists is_iced boolean not null default false,
  add column if not exists rating numeric(2, 1),
  add column if not exists coffee_beans text,
  add column if not exists roast_level text,
  add column if not exists bean_origin text,
  add column if not exists process text,
  add column if not exists roast_date_label text,
  add column if not exists producer text,
  add column if not exists variety text,
  add column if not exists brewing_tips text,
  add column if not exists flavor_finish integer,
  add column if not exists similar_slugs text[] not null default '{}'::text[];

comment on column public.recipes.country_id is
  'Gulf Directory country for the recipe''s roaster location.';
comment on column public.recipes.city_id is
  'Gulf Directory city for the recipe''s roaster location.';
comment on column public.recipes.brew_method is
  'Display brew-method label used by the Gulf recipe UI (e.g. V60, Origami).';
comment on column public.recipes.is_iced is
  'True when the recipe is an iced / flash-brew / cold preparation.';
comment on column public.recipes.rating is
  'Editorial rating shown on Gulf recipe cards (1.0–5.0).';
comment on column public.recipes.coffee_beans is
  'Coffee lot / beans label for the Gulf recipe detail view.';
comment on column public.recipes.bean_origin is
  'Coffee producing origin label (distinct from Gulf country_id).';
comment on column public.recipes.roast_date_label is
  'Human-readable roast freshness window (e.g. Within 7–28 days).';
comment on column public.recipes.flavor_finish is
  '0–100 finish intensity for the Gulf flavor wheel.';
comment on column public.recipes.similar_slugs is
  'Related Gulf recipe slugs for the similar-recipes rail.';

create index if not exists recipes_country_id_idx on public.recipes (country_id);
create index if not exists recipes_city_id_idx on public.recipes (city_id);
create index if not exists recipes_brew_method_idx on public.recipes (brew_method);
create index if not exists recipes_is_iced_idx on public.recipes (is_iced) where is_iced = true;
create index if not exists recipes_gulf_directory_idx
  on public.recipes (country_id, roaster_id, status)
  where recipe_kind = 'official' and status = 'published';

-- ---------------------------------------------------------------------------
-- recipe_steps
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_steps (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  step_key text,
  pour_number integer not null check (pour_number > 0),
  water_amount text,
  time_label text,
  notes text not null default '',
  at_seconds integer not null default 0,
  duration_seconds integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipe_steps_recipe_id_idx
  on public.recipe_steps (recipe_id, sort_order);

comment on table public.recipe_steps is
  'Ordered brew steps for Gulf / CMS recipes (text amounts for UI parity).';

drop trigger if exists recipe_steps_set_updated_at on public.recipe_steps;
create trigger recipe_steps_set_updated_at
  before update on public.recipe_steps
  for each row
  execute function public.set_updated_at();

alter table public.recipe_steps enable row level security;

drop policy if exists "Recipe steps are viewable when their recipe is" on public.recipe_steps;
create policy "Recipe steps are viewable when their recipe is"
  on public.recipe_steps for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_steps.recipe_id
        and (
          r.status = 'published'
          or r.published = true
          or r.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "Authors can manage steps on their own recipes" on public.recipe_steps;
create policy "Authors can manage steps on their own recipes"
  on public.recipe_steps for all
  to authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_steps.recipe_id and r.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_steps.recipe_id and r.author_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage all recipe steps" on public.recipe_steps;
create policy "Admins can manage all recipe steps"
  on public.recipe_steps for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- recipe_equipment
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_equipment (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  name text not null,
  detail text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipe_equipment_recipe_id_idx
  on public.recipe_equipment (recipe_id, sort_order);

comment on table public.recipe_equipment is
  'Equipment list rows for a recipe detail page.';

drop trigger if exists recipe_equipment_set_updated_at on public.recipe_equipment;
create trigger recipe_equipment_set_updated_at
  before update on public.recipe_equipment
  for each row
  execute function public.set_updated_at();

alter table public.recipe_equipment enable row level security;

drop policy if exists "Recipe equipment is viewable when their recipe is" on public.recipe_equipment;
create policy "Recipe equipment is viewable when their recipe is"
  on public.recipe_equipment for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_equipment.recipe_id
        and (
          r.status = 'published'
          or r.published = true
          or r.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "Authors can manage equipment on their own recipes" on public.recipe_equipment;
create policy "Authors can manage equipment on their own recipes"
  on public.recipe_equipment for all
  to authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_equipment.recipe_id and r.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_equipment.recipe_id and r.author_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage all recipe equipment" on public.recipe_equipment;
create policy "Admins can manage all recipe equipment"
  on public.recipe_equipment for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- recipe_flavor_notes
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_flavor_notes (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  note text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recipe_flavor_notes_recipe_id_idx
  on public.recipe_flavor_notes (recipe_id, sort_order);

comment on table public.recipe_flavor_notes is
  'Flavor wheel / tasting tags for a recipe.';

drop trigger if exists recipe_flavor_notes_set_updated_at on public.recipe_flavor_notes;
create trigger recipe_flavor_notes_set_updated_at
  before update on public.recipe_flavor_notes
  for each row
  execute function public.set_updated_at();

alter table public.recipe_flavor_notes enable row level security;

drop policy if exists "Recipe flavor notes are viewable when their recipe is" on public.recipe_flavor_notes;
create policy "Recipe flavor notes are viewable when their recipe is"
  on public.recipe_flavor_notes for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_flavor_notes.recipe_id
        and (
          r.status = 'published'
          or r.published = true
          or r.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "Authors can manage flavor notes on their own recipes" on public.recipe_flavor_notes;
create policy "Authors can manage flavor notes on their own recipes"
  on public.recipe_flavor_notes for all
  to authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_flavor_notes.recipe_id and r.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_flavor_notes.recipe_id and r.author_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage all recipe flavor notes" on public.recipe_flavor_notes;
create policy "Admins can manage all recipe flavor notes"
  on public.recipe_flavor_notes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- recipe_brew_variables
-- ---------------------------------------------------------------------------

create table if not exists public.recipe_brew_variables (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  key text not null,
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recipe_id, key)
);

create index if not exists recipe_brew_variables_recipe_id_idx
  on public.recipe_brew_variables (recipe_id, sort_order);

comment on table public.recipe_brew_variables is
  'Key/value brew parameters for CMS flexibility (dose, water, temp, ratio, etc.).';

drop trigger if exists recipe_brew_variables_set_updated_at on public.recipe_brew_variables;
create trigger recipe_brew_variables_set_updated_at
  before update on public.recipe_brew_variables
  for each row
  execute function public.set_updated_at();

alter table public.recipe_brew_variables enable row level security;

drop policy if exists "Recipe brew variables are viewable when their recipe is" on public.recipe_brew_variables;
create policy "Recipe brew variables are viewable when their recipe is"
  on public.recipe_brew_variables for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_brew_variables.recipe_id
        and (
          r.status = 'published'
          or r.published = true
          or r.author_id = auth.uid()
          or public.is_admin()
        )
    )
  );

drop policy if exists "Authors can manage brew variables on their own recipes" on public.recipe_brew_variables;
create policy "Authors can manage brew variables on their own recipes"
  on public.recipe_brew_variables for all
  to authenticated
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_brew_variables.recipe_id and r.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_brew_variables.recipe_id and r.author_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage all recipe brew variables" on public.recipe_brew_variables;
create policy "Admins can manage all recipe brew variables"
  on public.recipe_brew_variables for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
