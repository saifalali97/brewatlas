-- Shared helper functions used by RLS policies and triggers across the
-- BrewAtlas schema. Kept in their own migration so later migrations can
-- rely on them existing.
--
-- Note: public.is_admin() lives in the profiles migration instead of here,
-- since (as a `language sql` function) it is analyzed against the
-- public.profiles table at creation time and must be defined after that
-- table exists.

-- Generic trigger function: stamps NEW.updated_at with the current time.
-- Attached to any table that tracks last-modified time (e.g. recipes).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger function that stamps NEW.updated_at with the current time on every row update.';
