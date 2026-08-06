-- Gulf Roastery Directory foundation: extend public.roasters as the official
-- Gulf roastery directory for the Gulf-focused recipe library. Recipes continue
-- to link to roasters via coffees.roaster_id; no new tables or recipe columns.

alter table public.roasters
  add column if not exists instagram text,
  add column if not exists verified boolean not null default false,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists banner_image_url text;

comment on table public.roasters is
  'Official Gulf roastery directory and global coffee-roaster lookup. Directory entries span UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, and Oman; recipes reference roasters through coffees.roaster_id.';

comment on column public.roasters.instagram is
  'Instagram handle or profile URL for the roastery.';

comment on column public.roasters.verified is
  'Editorial verification flag for official Gulf roastery directory listings.';

comment on column public.roasters.updated_at is
  'Last modification timestamp; maintained by roasters_set_updated_at.';

comment on column public.roasters.banner_image_url is
  'Optional hero/banner image for roastery profile pages.';

create index if not exists roasters_verified_idx on public.roasters (verified) where verified = true;

create trigger roasters_set_updated_at
  before update on public.roasters
  for each row
  execute function public.set_updated_at();
