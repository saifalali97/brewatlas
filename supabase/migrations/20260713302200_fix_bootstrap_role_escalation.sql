-- Fix bootstrap_initial_admin() silently failing when auth.uid() is NULL.
--
-- prevent_role_escalation() relied solely on is_admin(), which checks auth.uid().
-- SQL editor (postgres) and service-role RPC calls have no JWT subject, so role
-- updates were reverted even for trusted server-side bootstrap.
--
-- Security model:
--   • Authenticated users still cannot change profile.role (auth.uid() is set).
--   • Existing admins/owners can assign roles through the API (is_admin()).
--   • Service-role server jobs may assign roles (bootstrap, moderation tooling).
--   • Postgres dashboard / migration sessions may assign roles when no JWT is present.

create or replace function public.is_trusted_role_assignment_context()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    -- Service-role Supabase clients (ensureInitialAdminFromEnv, admin RPC, webhooks).
    coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    -- Supabase SQL editor / direct postgres sessions (no end-user JWT).
    or (
      auth.uid() is null
      and current_user in ('postgres', 'supabase_admin')
      and coalesce(current_setting('request.jwt.claim.role', true), '') in ('', 'postgres')
    );
$$;

comment on function public.is_trusted_role_assignment_context() is
  'True for service-role and postgres dashboard contexts that may assign profile roles. False for authenticated API callers.';

revoke all on function public.is_trusted_role_assignment_context() from public;
grant execute on function public.is_trusted_role_assignment_context() to authenticated;
grant execute on function public.is_trusted_role_assignment_context() to service_role;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if public.is_admin() or public.is_trusted_role_assignment_context() then
      return new;
    end if;
    new.role := old.role;
  end if;
  return new;
end;
$$;

comment on function public.prevent_role_escalation() is
  'Blocks profile.role changes unless the caller is an admin/owner or a trusted server context (service role, postgres).';
