-- Extends the existing public.user_coffee_setups table (created in
-- 20260713250000_create_user_coffee_setups.sql) with the one field the
-- "My Coffee Setup" UI needs that wasn't modeled yet: the user's preferred
-- measurement units. No new table -- this is the same one-row-per-user
-- equipment record, just one more nullable column on it.

alter table public.user_coffee_setups
  add column preferred_units text
  check (preferred_units in ('metric', 'imperial'));

comment on column public.user_coffee_setups.preferred_units is
  'Preferred measurement units for displaying recipes ("metric" = grams/°C, "imperial" = oz/°F). Null means no preference set.';
