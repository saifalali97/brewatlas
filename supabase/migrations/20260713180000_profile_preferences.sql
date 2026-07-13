-- Extend profiles with the self-service preference fields surfaced on the
-- account/profile page: a short bio, and favorite brewing method/device
-- (both optional, nulled out automatically if the referenced lookup row is
-- ever removed).

alter table public.profiles
  add column bio text,
  add column favorite_brewing_method_id uuid references public.brewing_methods (id) on delete set null,
  add column favorite_device_id uuid references public.devices (id) on delete set null;

comment on column public.profiles.bio is 'Short user-authored bio shown on their profile.';
comment on column public.profiles.favorite_brewing_method_id is 'User-selected favorite brewing method.';
comment on column public.profiles.favorite_device_id is 'User-selected favorite brewing device.';

create index profiles_favorite_brewing_method_id_idx on public.profiles (favorite_brewing_method_id);
create index profiles_favorite_device_id_idx on public.profiles (favorite_device_id);
