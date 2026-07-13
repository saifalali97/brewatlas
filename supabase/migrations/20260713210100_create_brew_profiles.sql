-- brew_profiles: a precise, machine-readable brewing specification for the
-- upcoming Smart Brewing Engine. Unlike the free-form fields already on
-- `recipes`, every measurement here is structured so it can eventually be
-- replayed by a connected brewer or used to power brew recommendations.
--
-- Ownership follows the same pattern as `coffees`: shared reference-ish
-- data that any signed-in user can contribute, but only its creator (or an
-- admin) can edit/delete.

create table public.brew_profiles (
  id uuid primary key default gen_random_uuid(),
  dose numeric(6, 2),
  beverage_weight numeric(6, 2),
  brew_ratio text,
  water_temperature numeric(5, 2),
  brew_time text,
  bloom_time text,
  bloom_water numeric(6, 2),
  grinder_name text,
  grinder_setting text,
  filter_type text,
  agitation text,
  tds numeric(5, 2),
  extraction_yield numeric(5, 2),
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.brew_profiles is
  'A structured, replayable brewing specification for the Smart Brewing Engine.';
comment on column public.brew_profiles.brew_ratio is 'e.g. "1:16".';
comment on column public.brew_profiles.extraction_yield is 'Extraction yield percentage, e.g. 20.5.';

create index brew_profiles_created_by_idx on public.brew_profiles (created_by);

create trigger brew_profiles_set_updated_at
  before update on public.brew_profiles
  for each row
  execute function public.set_updated_at();

alter table public.brew_profiles enable row level security;

create policy "Brew profiles are viewable by everyone"
  on public.brew_profiles for select
  using (true);

create policy "Signed-in users can create brew profiles"
  on public.brew_profiles for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own brew profiles"
  on public.brew_profiles for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Users can delete their own brew profiles"
  on public.brew_profiles for delete
  using (auth.uid() = created_by);

create policy "Admins can manage all brew profiles"
  on public.brew_profiles for all
  using (public.is_admin())
  with check (public.is_admin());
