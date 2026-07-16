-- App-level RBAC for `/admin` routes.
-- profiles.role already exists; this migration documents the model, backfills
-- safe defaults, and adds a server-side helper for admin checks by user id.

comment on column public.profiles.role is
  'App authorization role. Regular members use user; elevated operators use admin. Legacy CMS roles (owner, editor, reviewer, writer) remain supported for /dashboard until phased out.';

update public.profiles
set role = 'user'
where role is null;

-- True when the given user id has admin-level access (admin or legacy owner).
create or replace function public.is_user_admin(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = p_user_id
      and role in ('admin', 'owner')
  );
$$;

comment on function public.is_user_admin(uuid) is
  'Returns true when the profile role grants access to /admin routes (admin or legacy owner).';

grant execute on function public.is_user_admin(uuid) to authenticated;
grant execute on function public.is_user_admin(uuid) to service_role;

-- Allow admins (not only owners) to assign the admin role; owners retain full control.
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
