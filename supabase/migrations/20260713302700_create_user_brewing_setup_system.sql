-- My Coffee Setup: multi-item equipment registry + brewing preferences profile.

create type public.user_equipment_category as enum (
  'brewer',
  'grinder',
  'kettle',
  'scale',
  'filter',
  'espresso_machine',
  'xbloom',
  'other'
);

create type public.user_experience_level as enum (
  'beginner',
  'intermediate',
  'advanced',
  'professional'
);

create type public.user_setup_context as enum (
  'home',
  'cafe',
  'both'
);

create table public.user_brewing_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  experience_level public.user_experience_level,
  setup_context public.user_setup_context not null default 'home',
  favorite_roast_level text,
  favorite_processing text,
  favorite_brew_ratio text,
  favorite_temperature_c numeric,
  preferred_units text check (preferred_units in ('metric', 'imperial')),
  preferred_water_profile_id uuid references public.water_profiles (id) on delete set null,
  favorite_brewing_method_id uuid references public.brewing_methods (id) on delete set null,
  default_brewer_item_id uuid,
  default_grinder_item_id uuid,
  default_kettle_item_id uuid,
  default_scale_item_id uuid,
  default_filter_item_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_brewing_profiles_user_id_key unique (user_id)
);

comment on table public.user_brewing_profiles is
  'Permanent brewing profile: preferences, defaults, and setup context for AI Coach and recipe matching.';

create table public.user_equipment_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category public.user_equipment_category not null,
  device_id uuid references public.devices (id) on delete set null,
  grinder_id uuid references public.grinders (id) on delete set null,
  filter_type_id uuid references public.filter_types (id) on delete set null,
  xbloom_device_id uuid references public.xbloom_devices (id) on delete set null,
  custom_label text,
  notes text,
  is_default boolean not null default false,
  is_favorite boolean not null default false,
  is_retired boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_equipment_items is
  'User-owned brewers, grinders, kettles, scales, filters, and other gear — supports multiples with default/favorite/retired flags.';

create table public.user_brewing_profile_origins (
  profile_id uuid not null references public.user_brewing_profiles (id) on delete cascade,
  origin_id uuid not null references public.origins (id) on delete cascade,
  primary key (profile_id, origin_id)
);

create table public.user_brewing_profile_recipes (
  profile_id uuid not null references public.user_brewing_profiles (id) on delete cascade,
  recipe_id uuid not null references public.recipes (id) on delete cascade,
  primary key (profile_id, recipe_id)
);

alter table public.user_brewing_profiles
  add constraint user_brewing_profiles_default_brewer_fkey
    foreign key (default_brewer_item_id) references public.user_equipment_items (id) on delete set null,
  add constraint user_brewing_profiles_default_grinder_fkey
    foreign key (default_grinder_item_id) references public.user_equipment_items (id) on delete set null,
  add constraint user_brewing_profiles_default_kettle_fkey
    foreign key (default_kettle_item_id) references public.user_equipment_items (id) on delete set null,
  add constraint user_brewing_profiles_default_scale_fkey
    foreign key (default_scale_item_id) references public.user_equipment_items (id) on delete set null,
  add constraint user_brewing_profiles_default_filter_fkey
    foreign key (default_filter_item_id) references public.user_equipment_items (id) on delete set null;

create index user_brewing_profiles_user_id_idx on public.user_brewing_profiles (user_id);
create index user_equipment_items_user_id_idx on public.user_equipment_items (user_id);
create index user_equipment_items_user_category_idx on public.user_equipment_items (user_id, category, is_retired);
create index user_equipment_items_grinder_id_idx on public.user_equipment_items (grinder_id) where grinder_id is not null;
create index user_equipment_items_device_id_idx on public.user_equipment_items (device_id) where device_id is not null;
create index user_brewing_profile_origins_origin_idx on public.user_brewing_profile_origins (origin_id);

create trigger user_brewing_profiles_set_updated_at
  before update on public.user_brewing_profiles
  for each row execute function public.set_updated_at();

create trigger user_equipment_items_set_updated_at
  before update on public.user_equipment_items
  for each row execute function public.set_updated_at();

alter table public.user_brewing_profiles enable row level security;
alter table public.user_equipment_items enable row level security;
alter table public.user_brewing_profile_origins enable row level security;
alter table public.user_brewing_profile_recipes enable row level security;

create policy "Users manage own brewing profile"
  on public.user_brewing_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins manage all brewing profiles"
  on public.user_brewing_profiles for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users manage own equipment items"
  on public.user_equipment_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins manage all equipment items"
  on public.user_equipment_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users manage own profile origins"
  on public.user_brewing_profile_origins for all
  using (
    exists (
      select 1 from public.user_brewing_profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_brewing_profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

create policy "Admins manage all profile origins"
  on public.user_brewing_profile_origins for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users manage own profile recipes"
  on public.user_brewing_profile_recipes for all
  using (
    exists (
      select 1 from public.user_brewing_profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_brewing_profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
  );

create policy "Admins manage all profile recipes"
  on public.user_brewing_profile_recipes for all
  using (public.is_admin())
  with check (public.is_admin());

-- Migrate legacy single-row coffee setups into the new model.
insert into public.user_brewing_profiles (user_id, preferred_water_profile_id, preferred_units)
select
  ucs.user_id,
  ucs.preferred_water_profile_id,
  ucs.preferred_units
from public.user_coffee_setups ucs
on conflict (user_id) do nothing;

insert into public.user_equipment_items (user_id, category, grinder_id, is_default, is_favorite, sort_order)
select ucs.user_id, 'grinder'::public.user_equipment_category, ucs.grinder_id, true, true, 0
from public.user_coffee_setups ucs
where ucs.grinder_id is not null;

insert into public.user_equipment_items (user_id, category, device_id, is_default, is_favorite, sort_order)
select ucs.user_id, 'brewer'::public.user_equipment_category, ucs.brewer_device_id, true, true, 0
from public.user_coffee_setups ucs
where ucs.brewer_device_id is not null;

insert into public.user_equipment_items (user_id, category, xbloom_device_id, is_default, is_favorite, sort_order)
select ucs.user_id, 'xbloom'::public.user_equipment_category, ucs.xbloom_device_id, true, true, 0
from public.user_coffee_setups ucs
where ucs.xbloom_device_id is not null;

insert into public.user_equipment_items (user_id, category, filter_type_id, is_default, is_favorite, sort_order)
select ucs.user_id, 'filter'::public.user_equipment_category, ucs.filter_type_id, true, true, 0
from public.user_coffee_setups ucs
where ucs.filter_type_id is not null;

insert into public.user_equipment_items (user_id, category, custom_label, is_default, sort_order)
select ucs.user_id, 'espresso_machine'::public.user_equipment_category, ucs.espresso_machine, true, 0
from public.user_coffee_setups ucs
where ucs.espresso_machine is not null and btrim(ucs.espresso_machine) <> '';

insert into public.user_equipment_items (user_id, category, custom_label, is_default, sort_order)
select ucs.user_id, 'kettle'::public.user_equipment_category, ucs.kettle, true, 0
from public.user_coffee_setups ucs
where ucs.kettle is not null and btrim(ucs.kettle) <> '';

insert into public.user_equipment_items (user_id, category, custom_label, is_default, sort_order)
select ucs.user_id, 'scale'::public.user_equipment_category, ucs.scale, true, 0
from public.user_coffee_setups ucs
where ucs.scale is not null and btrim(ucs.scale) <> '';

update public.user_brewing_profiles p
set
  default_grinder_item_id = g.id,
  default_brewer_item_id = b.id,
  default_filter_item_id = f.id,
  default_kettle_item_id = k.id,
  default_scale_item_id = s.id
from public.user_coffee_setups ucs
left join lateral (
  select id from public.user_equipment_items
  where user_id = ucs.user_id and category = 'grinder' and grinder_id = ucs.grinder_id
  order by is_default desc, created_at asc limit 1
) g on true
left join lateral (
  select id from public.user_equipment_items
  where user_id = ucs.user_id and category = 'brewer' and device_id = ucs.brewer_device_id
  order by is_default desc, created_at asc limit 1
) b on true
left join lateral (
  select id from public.user_equipment_items
  where user_id = ucs.user_id and category = 'filter' and filter_type_id = ucs.filter_type_id
  order by is_default desc, created_at asc limit 1
) f on true
left join lateral (
  select id from public.user_equipment_items
  where user_id = ucs.user_id and category = 'kettle' and custom_label = ucs.kettle
  order by is_default desc, created_at asc limit 1
) k on true
left join lateral (
  select id from public.user_equipment_items
  where user_id = ucs.user_id and category = 'scale' and custom_label = ucs.scale
  order by is_default desc, created_at asc limit 1
) s on true
where p.user_id = ucs.user_id;

-- Admin: equipment popularity across all users.
create or replace function public.admin_brewing_setup_equipment_stats(p_limit integer default 10)
returns table (
  category text,
  item_name text,
  user_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select * from (
    select 'grinder'::text as category, g.name as item_name, count(distinct e.user_id)::bigint as user_count
    from public.user_equipment_items e
    join public.grinders g on g.id = e.grinder_id
    where e.category = 'grinder' and not e.is_retired
    group by g.name
    union all
    select 'brewer', d.name, count(distinct e.user_id)::bigint
    from public.user_equipment_items e
    join public.devices d on d.id = e.device_id
    where e.category = 'brewer' and not e.is_retired
    group by d.name
    union all
    select 'xbloom', x.name, count(distinct e.user_id)::bigint
    from public.user_equipment_items e
    join public.xbloom_devices x on x.id = e.xbloom_device_id
    where e.category = 'xbloom' and not e.is_retired
    group by x.name
    union all
    select e.category::text, coalesce(e.custom_label, 'Unnamed'), count(distinct e.user_id)::bigint
    from public.user_equipment_items e
    where e.category in ('kettle', 'scale', 'espresso_machine', 'other')
      and not e.is_retired
      and e.custom_label is not null
    group by e.category, e.custom_label
  ) stats
  order by user_count desc, category, item_name
  limit greatest(p_limit, 1);
$$;

revoke all on function public.admin_brewing_setup_equipment_stats(integer) from public;
grant execute on function public.admin_brewing_setup_equipment_stats(integer) to authenticated;
