-- recipe_tags: many-to-many join between recipes and tags.

create table public.recipe_tags (
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recipe_id, tag_id)
);

comment on table public.recipe_tags is 'Join table: which tags apply to which recipes.';

create index recipe_tags_tag_id_idx on public.recipe_tags (tag_id);

alter table public.recipe_tags enable row level security;

create policy "Recipe tags are viewable when their recipe is"
  on public.recipe_tags for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_tags.recipe_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage tags on their own recipes"
  on public.recipe_tags for all
  using (
    exists (select 1 from public.recipes r where r.id = recipe_tags.recipe_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = recipe_tags.recipe_id and r.author_id = auth.uid())
  );

create policy "Admins can manage all recipe tags"
  on public.recipe_tags for all
  using (public.is_admin())
  with check (public.is_admin());
