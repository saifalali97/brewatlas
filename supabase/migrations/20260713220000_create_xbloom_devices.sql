-- xbloom_devices: the supported hardware catalog for the xBloom Integration
-- Foundation. Kept as its own lookup (rather than a free-text column) so a
-- future profile editor has a canonical, extensible list to validate
-- against and populate a <select> from. Public read, admin-only write.

create table public.xbloom_devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint xbloom_devices_slug_key unique (slug)
);

comment on table public.xbloom_devices is
  'Supported xBloom hardware models for the xBloom Integration Foundation.';

alter table public.xbloom_devices enable row level security;

create policy "xBloom devices are viewable by everyone"
  on public.xbloom_devices for select
  using (true);

create policy "Admins can manage xBloom devices"
  on public.xbloom_devices for all
  using (public.is_admin())
  with check (public.is_admin());
