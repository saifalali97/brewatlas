-- brew_devices: a focused equipment catalog for the upcoming Smart Brewing
-- Engine. Deliberately separate from the existing `devices` lookup (used by
-- the classic recipe form) so it can model specific hardware revisions
-- (e.g. "V60-01" vs "V60-02") without disturbing the current recipe schema.
-- Public read, admin-only write -- same convention as the other lookups.

create table public.brew_devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint brew_devices_slug_key unique (slug)
);

comment on table public.brew_devices is
  'Equipment catalog for the Smart Brewing Engine (distinct from the general devices lookup).';

alter table public.brew_devices enable row level security;

create policy "Brew devices are viewable by everyone"
  on public.brew_devices for select
  using (true);

create policy "Admins can manage brew devices"
  on public.brew_devices for all
  using (public.is_admin())
  with check (public.is_admin());
