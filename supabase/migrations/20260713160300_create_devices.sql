-- devices: reference list of brewing equipment/devices. Public read,
-- admin-only write.

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  manufacturer text,
  created_at timestamptz not null default now(),
  constraint devices_slug_key unique (slug)
);

comment on table public.devices is
  'Reference list of brewing devices/equipment used by recipes.';

create index devices_manufacturer_idx on public.devices (manufacturer);

alter table public.devices enable row level security;

create policy "Devices are viewable by everyone"
  on public.devices
  for select
  using (true);

create policy "Admins can manage devices"
  on public.devices
  for all
  using (public.is_admin())
  with check (public.is_admin());
