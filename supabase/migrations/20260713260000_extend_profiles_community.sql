-- Extends profiles with the remaining public-profile fields needed by the
-- Coffee Community system: favorite origin/coffee/roaster/grinder (favorite
-- brewing method and favorite device already exist from
-- 20260713180000_profile_preferences.sql) and an explicit xBloom ownership
-- flag. All nullable/optional -- a profile is valid with none of them set.

alter table public.profiles
  add column favorite_origin_id uuid references public.origins (id) on delete set null,
  add column favorite_coffee_id uuid references public.coffees (id) on delete set null,
  add column favorite_roaster_id uuid references public.roasters (id) on delete set null,
  add column favorite_grinder_id uuid references public.grinders (id) on delete set null,
  add column owns_xbloom boolean not null default false;

comment on column public.profiles.favorite_origin_id is 'User-selected favorite coffee origin, shown on their public profile.';
comment on column public.profiles.favorite_coffee_id is 'User-selected favorite specific coffee lot, shown on their public profile.';
comment on column public.profiles.favorite_roaster_id is 'User-selected favorite roaster, shown on their public profile.';
comment on column public.profiles.favorite_grinder_id is 'User-selected favorite grinder, shown on their public profile.';
comment on column public.profiles.owns_xbloom is
  'Explicit "I own an xBloom" flag for the public profile and the xBloom Owner badge, independent of whether they''ve filled in user_coffee_setups.xbloom_device_id.';

create index profiles_favorite_origin_id_idx on public.profiles (favorite_origin_id);
create index profiles_favorite_coffee_id_idx on public.profiles (favorite_coffee_id);
create index profiles_favorite_roaster_id_idx on public.profiles (favorite_roaster_id);
create index profiles_favorite_grinder_id_idx on public.profiles (favorite_grinder_id);

-- The Coffee Community system treats a profile as public (display name,
-- avatar, country, favorites, bio, and -- via user_community_stats --
-- brewing statistics), unlike the original owner-only profiles policy.
-- Add public read access without touching the existing owner/admin
-- policies, which continue to govern writes.
create policy "Profiles are publicly viewable"
  on public.profiles
  for select
  using (true);
