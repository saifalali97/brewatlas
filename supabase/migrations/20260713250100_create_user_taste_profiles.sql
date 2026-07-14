-- user_taste_profiles: "My Taste Profile" -- a user's sensory preferences,
-- used both to personalize the app today and as a structured feature set
-- for future AI-driven recipe recommendations (see comment below and
-- lib/data/personal.ts's getTasteProfileFeatureVector).
--
-- Preference/flavor-note scores use the same 1-10 scale already used for
-- recipes.sweetness/acidity/body/bitterness, so a user's stated
-- preferences and a recipe's actual sensory profile are directly
-- comparable.

create table public.user_taste_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  acidity_preference smallint check (acidity_preference between 1 and 10),
  sweetness_preference smallint check (sweetness_preference between 1 and 10),
  body_preference smallint check (body_preference between 1 and 10),
  fruity smallint check (fruity between 1 and 10),
  chocolate smallint check (chocolate between 1 and 10),
  floral smallint check (floral between 1 and 10),
  nutty smallint check (nutty between 1 and 10),
  fermented smallint check (fermented between 1 and 10),
  tea_like smallint check (tea_like between 1 and 10),
  roast_preference text check (roast_preference in ('Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_taste_profiles_user_id_key unique (user_id)
);

comment on table public.user_taste_profiles is
  'A user''s stated sensory preferences ("My Taste Profile"): acidity/sweetness/body preference, flavor-note affinities, and roast preference. Feeds future AI recipe recommendations.';
comment on column public.user_taste_profiles.fruity is 'How much the user enjoys fruity flavor notes, 1 (dislikes) - 10 (loves).';
comment on column public.user_taste_profiles.tea_like is 'How much the user enjoys tea-like/floral-delicate flavor notes, 1 (dislikes) - 10 (loves).';

create index user_taste_profiles_user_id_idx on public.user_taste_profiles (user_id);

create trigger user_taste_profiles_set_updated_at
  before update on public.user_taste_profiles
  for each row
  execute function public.set_updated_at();

alter table public.user_taste_profiles enable row level security;

create policy "Users can manage their own taste profile"
  on public.user_taste_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage all taste profiles"
  on public.user_taste_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- user_taste_profile_processes: a user's favorite processing methods
-- (washed, natural, honey, etc.) -- normalized as its own table (rather
-- than an array column) so it can grow and be queried/joined like any
-- other BrewAtlas child table.
create table public.user_taste_profile_processes (
  id uuid primary key default gen_random_uuid(),
  taste_profile_id uuid not null references public.user_taste_profiles (id) on delete cascade,
  process text not null,
  created_at timestamptz not null default now(),
  constraint user_taste_profile_processes_key unique (taste_profile_id, process)
);

comment on table public.user_taste_profile_processes is
  'Favorite coffee processing methods (e.g. Washed, Natural, Honey) belonging to a user_taste_profiles row.';

create index user_taste_profile_processes_profile_id_idx on public.user_taste_profile_processes (taste_profile_id);

alter table public.user_taste_profile_processes enable row level security;

create policy "Users can manage processes on their own taste profile"
  on public.user_taste_profile_processes for all
  using (
    exists (
      select 1 from public.user_taste_profiles p
      where p.id = user_taste_profile_processes.taste_profile_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_taste_profiles p
      where p.id = user_taste_profile_processes.taste_profile_id and p.user_id = auth.uid()
    )
  );

create policy "Admins can manage all taste profile processes"
  on public.user_taste_profile_processes for all
  using (public.is_admin())
  with check (public.is_admin());
