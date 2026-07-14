-- Extends the existing public.user_brew_logs table (created in
-- 20260713250200_create_user_brew_logs.sql) with the brew-session fields
-- the Brew Log UI needs. No new table -- nullable columns on the same
-- personal brew-history record.

alter table public.user_brew_logs
  add column coffee_name text,
  add column grinder_id uuid references public.grinders (id) on delete set null,
  add column grind_size text,
  add column water_amount numeric,
  add column brew_time text;

comment on column public.user_brew_logs.coffee_name is
  'Coffee used in this brew session (bag name or origin), independent of recipe_id.';
comment on column public.user_brew_logs.grinder_id is
  'Grinder used for this brew, referencing public.grinders.';
comment on column public.user_brew_logs.grind_size is
  'Grind setting for this brew (e.g. "medium-fine", "18 clicks").';
comment on column public.user_brew_logs.water_amount is
  'Water used in grams for this brew session.';
comment on column public.user_brew_logs.brew_time is
  'Total brew time for this session (e.g. "3:30", "2m 45s").';

create index user_brew_logs_grinder_id_idx on public.user_brew_logs (grinder_id);
