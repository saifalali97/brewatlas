-- profiles: one row per auth.users account, storing public-facing profile
-- data and the app-level role used for authorization checks.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  country text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Public profile data for an auth.users account, including app role.';

create index profiles_role_idx on public.profiles (role);

-- Returns true when the currently authenticated user (auth.uid()) has the
-- 'admin' role. SECURITY DEFINER with a fixed search_path lets this run
-- inside RLS policies on public.profiles itself without being blocked by
-- that table's own RLS, and without being hijackable via search_path
-- tricks. Defined here (rather than in the helper_functions migration)
-- because, as a `language sql` function, it is analyzed against
-- public.profiles at creation time.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  'True when the calling user (auth.uid()) has role = admin in public.profiles.';

alter table public.profiles enable row level security;

-- Every user can read their own profile.
create policy "Profiles are viewable by owner"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Every user can update their own profile (role changes are neutralized
-- below unless the caller is already an admin).
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can read/write every profile, including inserting/deleting rows
-- directly if ever needed for support tooling.
create policy "Admins can manage all profiles"
  on public.profiles
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Prevent a non-admin from granting themselves (or anyone) the admin role
-- through the "update own profile" policy above.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_role_escalation();

-- Auto-provision a profile row whenever a new Supabase auth user is
-- created, seeded from their signup metadata when available.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
