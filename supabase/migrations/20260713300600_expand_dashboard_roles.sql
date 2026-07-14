-- Phase 21.1: expand profiles.role for the BrewAtlas CMS and add owner helpers.
-- Legacy `admin` rows are migrated to `owner` so existing RLS continues to work.

alter table public.profiles drop constraint if exists profiles_role_check;

alter table public.profiles add constraint profiles_role_check check (
  role in ('user', 'owner', 'admin', 'editor', 'reviewer', 'writer')
);

update public.profiles
set role = 'owner'
where role = 'admin';

create or replace function public.is_owner()
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
      and role = 'owner'
  );
$$;

comment on function public.is_owner() is
  'True when the calling user has role = owner (full CMS access).';

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
      and role in ('owner', 'admin')
  );
$$;

comment on function public.is_admin() is
  'True when the calling user has owner or admin role. Owner is the canonical full-access role.';

create or replace function public.has_dashboard_role()
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
      and role in ('owner', 'admin', 'editor', 'reviewer', 'writer')
  );
$$;

comment on function public.has_dashboard_role() is
  'True when the calling user has any CMS team role (owner has full permissions).';

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_owner() then
    new.role = old.role;
  end if;
  return new;
end;
$$;

grant execute on function public.is_owner() to authenticated;
grant execute on function public.has_dashboard_role() to authenticated;
