-- Bootstrap the first BrewAtlas admin without manual SQL.
-- Called from deployment (instrumentation) via service role and optionally from migrations.

create or replace function public.bootstrap_initial_admin(p_email text default null)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_email text := nullif(trim(p_email), '');
begin
  if v_email is not null then
    select u.id
    into v_user_id
    from auth.users u
    where lower(u.email) = lower(v_email)
    limit 1;
  end if;

  -- Founding-account fallback: when no elevated operator exists yet, promote the earliest profile.
  if v_user_id is null and not exists (
    select 1 from public.profiles where role in ('admin', 'owner')
  ) then
    select p.id
    into v_user_id
    from public.profiles p
    order by p.created_at asc
    limit 1;
  end if;

  if v_user_id is null then
    return false;
  end if;

  update public.profiles
  set role = 'admin'
  where id = v_user_id
    and role = 'user';

  return true;
end;
$$;

comment on function public.bootstrap_initial_admin(text) is
  'Promotes the bootstrap email account (or founding profile when none exists) to admin. Idempotent.';

revoke all on function public.bootstrap_initial_admin(text) from public;
grant execute on function public.bootstrap_initial_admin(text) to service_role;

-- Run once during migration when no admin exists (founding profile safety net).
select public.bootstrap_initial_admin(null);
