-- Phase 21.4: Owner CMS Media Library — folders, assets, variants, and usage tracking.

create table public.media_folders (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.media_folders is 'Organizational folders for the owner media library.';

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.media_folders (id) on delete set null,
  filename text not null,
  storage_path text not null unique,
  public_url text not null,
  alt_text text,
  caption text,
  tags text[] not null default '{}'::text[],
  width integer,
  height integer,
  file_size integer not null default 0,
  mime_type text not null,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.media_assets is 'Central media library assets with metadata and public storage URLs.';

create index media_assets_folder_id_idx on public.media_assets (folder_id);
create index media_assets_created_at_idx on public.media_assets (created_at desc);
create index media_assets_filename_idx on public.media_assets using gin (to_tsvector('simple', filename));
create index media_assets_tags_idx on public.media_assets using gin (tags);

create trigger media_assets_set_updated_at
  before update on public.media_assets
  for each row
  execute function public.set_updated_at();

create table public.media_asset_variants (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id) on delete cascade,
  variant_key text not null check (variant_key in ('thumbnail', 'sm', 'md', 'lg', 'original')),
  storage_path text not null,
  public_url text not null,
  width integer,
  height integer,
  file_size integer not null default 0,
  created_at timestamptz not null default now(),
  constraint media_asset_variants_asset_variant_key unique (asset_id, variant_key)
);

comment on table public.media_asset_variants is 'Responsive/compressed variants generated on upload.';

create index media_asset_variants_asset_id_idx on public.media_asset_variants (asset_id);

create table public.media_asset_usages (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.media_assets (id) on delete restrict,
  entity_type text not null check (entity_type in ('recipe', 'recipe_gallery')),
  entity_id uuid not null,
  usage_field text not null default 'cover',
  created_at timestamptz not null default now(),
  constraint media_asset_usages_unique unique (asset_id, entity_type, entity_id, usage_field)
);

comment on table public.media_asset_usages is 'Tracks where a media asset is referenced to prevent unsafe deletes.';

create index media_asset_usages_asset_id_idx on public.media_asset_usages (asset_id);
create index media_asset_usages_entity_idx on public.media_asset_usages (entity_type, entity_id);

-- Optional linkage on recipes and gallery rows (URL columns remain for backwards compatibility).
alter table public.recipes
  add column if not exists cover_media_asset_id uuid references public.media_assets (id) on delete set null;

alter table public.recipe_images
  add column if not exists media_asset_id uuid references public.media_assets (id) on delete set null;

create index if not exists recipes_cover_media_asset_id_idx on public.recipes (cover_media_asset_id);
create index if not exists recipe_images_media_asset_id_idx on public.recipe_images (media_asset_id);

insert into public.media_folders (slug, name, sort_order)
values
  ('coffee', 'Coffee', 1),
  ('brewers', 'Brewers', 2),
  ('devices', 'Devices', 3),
  ('origins', 'Origins', 4),
  ('blog', 'Blog', 5),
  ('recipes', 'Recipes', 6),
  ('logos', 'Logos', 7)
on conflict (slug) do nothing;

alter table public.media_folders enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_asset_variants enable row level security;
alter table public.media_asset_usages enable row level security;

create policy "Admins can manage media folders"
  on public.media_folders for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage media assets"
  on public.media_assets for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage media asset variants"
  on public.media_asset_variants for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage media asset usages"
  on public.media_asset_usages for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public read for assets (served on public recipe pages).
create policy "Media assets are publicly readable"
  on public.media_assets for select
  using (true);

create policy "Media folders are publicly readable"
  on public.media_folders for select
  using (true);

create policy "Media variants are publicly readable"
  on public.media_asset_variants for select
  using (true);

insert into storage.buckets (id, name, public)
values ('media-library', 'media-library', true)
on conflict (id) do nothing;

create policy "Media library files are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'media-library');

create policy "Admins can upload media library files"
  on storage.objects for insert
  with check (bucket_id = 'media-library' and public.is_admin());

create policy "Admins can update media library files"
  on storage.objects for update
  using (bucket_id = 'media-library' and public.is_admin());

create policy "Admins can delete media library files"
  on storage.objects for delete
  using (bucket_id = 'media-library' and public.is_admin());
