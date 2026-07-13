-- `favorites` RLS intentionally only lets a user see their own rows, so a
-- plain `count(*)` query from a viewer would always report 0 for every
-- recipe except ones *they* favorited. This SECURITY DEFINER function
-- returns the true total favorites count for a recipe (an aggregate, not
-- the underlying rows) without exposing who favorited it.
create or replace function public.recipe_favorites_count(recipe uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*)
  from public.favorites
  where recipe_id = recipe;
$$;

comment on function public.recipe_favorites_count(uuid) is
  'Total number of users who favorited a recipe, bypassing per-row favorites RLS.';

grant execute on function public.recipe_favorites_count(uuid) to anon, authenticated;
