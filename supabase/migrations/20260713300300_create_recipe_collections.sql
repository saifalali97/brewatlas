-- recipe_collections + recipe_collection_items: user-curated recipe lists.
-- Powers the Collections UI (`/dashboard/collections`). Membership
-- limits (`recipe_collections` feature) are enforced in server actions
-- via `canCreateCollection` — not in the schema.

create table public.recipe_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recipe_collections_user_id_name_key unique (user_id, name)
);

comment on table public.recipe_collections is
  'User-curated recipe collections ("Collections"). One user may have many; names are unique per user.';

create index recipe_collections_user_id_idx on public.recipe_collections (user_id);

create trigger recipe_collections_set_updated_at
  before update on public.recipe_collections
  for each row
  execute function public.set_updated_at();

create table public.recipe_collection_items (
  collection_id uuid not null references public.recipe_collections (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, recipe_id)
);

comment on table public.recipe_collection_items is
  'Join table: which recipes belong to which user collection.';

create index recipe_collection_items_recipe_id_idx on public.recipe_collection_items (recipe_id);

alter table public.recipe_collections enable row level security;
alter table public.recipe_collection_items enable row level security;

create policy "Users can manage their own collections"
  on public.recipe_collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all collections"
  on public.recipe_collections for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users can manage items in their own collections"
  on public.recipe_collection_items for all
  using (
    exists (
      select 1 from public.recipe_collections rc
      where rc.id = collection_id and rc.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.recipe_collections rc
      where rc.id = collection_id and rc.user_id = auth.uid()
    )
  );

create policy "Admins can manage all collection items"
  on public.recipe_collection_items for all
  using (public.is_admin())
  with check (public.is_admin());
