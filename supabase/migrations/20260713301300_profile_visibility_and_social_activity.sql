-- Phase 21.8: Profile visibility (public/private) and extended activity feed types.

alter table public.profiles
  add column if not exists profile_visibility text not null default 'public'
    check (profile_visibility in ('public', 'private'));

comment on column public.profiles.profile_visibility is
  'Whether the profile is discoverable at /users/[id]. Private profiles are visible only to the owner.';

create index if not exists profiles_visibility_idx on public.profiles (profile_visibility);

drop policy if exists "Profiles are publicly viewable" on public.profiles;

create policy "Profiles are publicly viewable"
  on public.profiles
  for select
  using (
    profile_visibility = 'public'
    or auth.uid() = id
    or public.is_admin()
  );

alter table public.user_activities
  drop constraint if exists user_activities_activity_type_check;

alter table public.user_activities
  add constraint user_activities_activity_type_check
  check (
    activity_type in (
      'brewed_recipe',
      'created_recipe',
      'reviewed_recipe',
      'earned_badge',
      'followed_user',
      'saved_recipe',
      'added_to_collection'
    )
  );
