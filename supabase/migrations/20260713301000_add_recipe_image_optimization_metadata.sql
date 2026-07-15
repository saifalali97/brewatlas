-- Phase 21.5: Image optimization metadata for recipes, gallery rows, and media assets.

alter table public.recipes
  add column if not exists cover_image_width integer,
  add column if not exists cover_image_height integer,
  add column if not exists cover_image_alt text,
  add column if not exists cover_image_blur text;

alter table public.recipe_images
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists alt_text text,
  add column if not exists blur_data_url text;

alter table public.media_assets
  add column if not exists blur_data_url text;

comment on column public.recipes.cover_image_blur is 'Base64 blur data URL for Next.js placeholder="blur".';
comment on column public.recipe_images.blur_data_url is 'Base64 blur data URL for gallery lazy-load placeholders.';
comment on column public.media_assets.blur_data_url is 'Base64 blur data URL generated on upload.';
