-- recipe_likes: lightweight "like" signal on a recipe, distinct from
-- `favorites` (which represents bookmarking/saving a recipe for later).
-- Same shape as `favorites`, but public: like counts are shown on public
-- recipes and feed the Trending system, so both the rows and their counts
-- need to be readable by anyone.

create table public.recipe_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);

comment on table public.recipe_likes is
  'Join table: which users have liked which recipes. Public, unlike the private favorites table.';

create index recipe_likes_recipe_id_idx on public.recipe_likes (recipe_id);
create index recipe_likes_user_id_idx on public.recipe_likes (user_id);

alter table public.recipe_likes enable row level security;

create policy "Recipe likes are publicly viewable"
  on public.recipe_likes for select
  using (true);

create policy "Users can like recipes as themselves"
  on public.recipe_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike recipes as themselves"
  on public.recipe_likes for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all recipe likes"
  on public.recipe_likes for all
  using (public.is_admin())
  with check (public.is_admin());
