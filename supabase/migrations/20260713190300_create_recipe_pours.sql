-- recipe_pours: unlimited, ordered pour steps for a recipe (pour number,
-- water amount, time, notes), replacing the old untyped `pours` jsonb blob
-- with a proper normalized table.

create table public.recipe_pours (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  pour_number integer not null check (pour_number > 0),
  water_amount numeric(6, 2),
  time_label text,
  notes text,
  created_at timestamptz not null default now(),
  constraint recipe_pours_recipe_id_pour_number_key unique (recipe_id, pour_number)
);

comment on table public.recipe_pours is 'Ordered pour steps belonging to a recipe.';

create index recipe_pours_recipe_id_idx on public.recipe_pours (recipe_id);

alter table public.recipe_pours enable row level security;

-- A pour is visible exactly when its parent recipe is (published, owned by
-- the caller, or the caller is an admin).
create policy "Pours are viewable when their recipe is"
  on public.recipe_pours for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_pours.recipe_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage pours on their own recipes"
  on public.recipe_pours for all
  using (
    exists (select 1 from public.recipes r where r.id = recipe_pours.recipe_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = recipe_pours.recipe_id and r.author_id = auth.uid())
  );

create policy "Admins can manage all pours"
  on public.recipe_pours for all
  using (public.is_admin())
  with check (public.is_admin());
