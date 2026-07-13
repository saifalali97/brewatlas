-- favorites: join table tracking which recipes a user has favorited. Both
-- foreign keys cascade so favorites are cleaned up automatically when the
-- user or the recipe is deleted.

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

comment on table public.favorites is
  'Join table: which users have favorited which recipes.';

create index favorites_recipe_id_idx on public.favorites (recipe_id);

alter table public.favorites enable row level security;

-- Users can only see, add, and remove their own favorites.
create policy "Users can view their own favorites"
  on public.favorites
  for select
  using (auth.uid() = user_id);

create policy "Users can add their own favorites"
  on public.favorites
  for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own favorites"
  on public.favorites
  for delete
  using (auth.uid() = user_id);

-- Admins can audit all favorites (read-only; they still can't fake being
-- the user for insert/delete since those policies check auth.uid()).
create policy "Admins can view all favorites"
  on public.favorites
  for select
  using (public.is_admin());
