-- Allow authenticated users to insert their own profile row when the
-- handle_new_user trigger did not run (e.g. legacy accounts, trigger
-- missing in an environment, or race before trigger completion).
-- ensureProfile() upserts with auth.uid() = id; without this policy
-- Postgres returns 42501 (RLS violation) on insert.

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (
    auth.uid() = id
    and role = 'user'
  );
