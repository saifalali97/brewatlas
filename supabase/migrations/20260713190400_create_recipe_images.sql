-- recipe_images: unlimited additional photos for a recipe (beyond the
-- single `cover_image_url` on the recipe itself), plus the public storage
-- bucket they're uploaded to.

create table public.recipe_images (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.recipe_images is 'Additional gallery photos for a recipe, beyond its cover image.';

create index recipe_images_recipe_id_idx on public.recipe_images (recipe_id);

alter table public.recipe_images enable row level security;

create policy "Recipe images are viewable when their recipe is"
  on public.recipe_images for select
  using (
    exists (
      select 1 from public.recipes r
      where r.id = recipe_images.recipe_id
        and (r.published = true or r.author_id = auth.uid() or public.is_admin())
    )
  );

create policy "Authors can manage images on their own recipes"
  on public.recipe_images for all
  using (
    exists (select 1 from public.recipes r where r.id = recipe_images.recipe_id and r.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.recipes r where r.id = recipe_images.recipe_id and r.author_id = auth.uid())
  );

create policy "Admins can manage all recipe images"
  on public.recipe_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- Storage bucket recipe images (covers + gallery photos) are uploaded to.
-- Public read; write is scoped to the uploader's own folder, matching the
-- avatars bucket's convention.
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

create policy "Recipe image files are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Users can upload their own recipe images"
  on storage.objects for insert
  with check (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own recipe image files"
  on storage.objects for update
  using (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own recipe image files"
  on storage.objects for delete
  using (bucket_id = 'recipe-images' and (storage.foldername(name))[1] = auth.uid()::text);
