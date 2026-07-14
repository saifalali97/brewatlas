-- user_coffee_setups: "My Coffee Setup" -- the equipment a user brews with
-- day to day. One row per user. References existing lookup tables where
-- one already exists (grinders, devices, filter_types, water_profiles,
-- xbloom_devices) to stay normalized and fully compatible with the
-- existing Recipe Engine and xBloom Engine; free-text columns cover
-- equipment categories that don't have a lookup table yet.

create table public.user_coffee_setups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  grinder_id uuid references public.grinders (id) on delete set null,
  brewer_device_id uuid references public.devices (id) on delete set null,
  xbloom_device_id uuid references public.xbloom_devices (id) on delete set null,
  espresso_machine text,
  kettle text,
  scale text,
  filter_type_id uuid references public.filter_types (id) on delete set null,
  favorite_mug text,
  favorite_server text,
  preferred_water_profile_id uuid references public.water_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_coffee_setups_user_id_key unique (user_id)
);

comment on table public.user_coffee_setups is
  'A user''s personal brewing equipment ("My Coffee Setup"): grinder, brewer, xBloom model, espresso machine, kettle, scale, filters, favorite mug/server, and preferred water.';
comment on column public.user_coffee_setups.brewer_device_id is
  'Primary brewer, referencing the same public.devices lookup used by recipes.device_id.';
comment on column public.user_coffee_setups.espresso_machine is
  'Free text -- no dedicated espresso machine lookup table exists yet.';

create index user_coffee_setups_user_id_idx on public.user_coffee_setups (user_id);
create index user_coffee_setups_grinder_id_idx on public.user_coffee_setups (grinder_id);
create index user_coffee_setups_brewer_device_id_idx on public.user_coffee_setups (brewer_device_id);

create trigger user_coffee_setups_set_updated_at
  before update on public.user_coffee_setups
  for each row
  execute function public.set_updated_at();

alter table public.user_coffee_setups enable row level security;

-- Personal data: only the owner (or an admin) can read or write it -- no
-- public read, unlike the editorial/lookup tables it references.
create policy "Users can manage their own coffee setup"
  on public.user_coffee_setups for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all coffee setups"
  on public.user_coffee_setups for all
  using (public.is_admin())
  with check (public.is_admin());
