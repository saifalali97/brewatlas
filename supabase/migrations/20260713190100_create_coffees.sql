-- coffees: a specific roasted coffee lot (roaster + origin + farm/producer/
-- variety/process/altitude/roast info). Recipes reference a coffee rather
-- than duplicating roaster/origin/farm details on every recipe row, so the
-- same coffee can be reused across multiple recipes.
--
-- Coffees are shared reference-ish data (like a lookup table) but, unlike
-- the admin-only lookups, any signed-in user can contribute a new one when
-- logging their own recipe -- they just can't edit/delete one they didn't
-- create (unless they're an admin).

create table public.coffees (
  id uuid primary key default gen_random_uuid(),
  roaster_id uuid references public.roasters (id) on delete set null,
  origin_id uuid references public.origins (id) on delete set null,
  name text not null,
  farm text,
  producer text,
  variety text,
  process text,
  altitude text,
  roast_level text,
  roast_date date,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.coffees is
  'A specific roasted coffee lot (roaster, origin, farm, variety, process, roast info) referenced by recipes.';

create index coffees_roaster_id_idx on public.coffees (roaster_id);
create index coffees_origin_id_idx on public.coffees (origin_id);
create index coffees_created_by_idx on public.coffees (created_by);

alter table public.coffees enable row level security;

create policy "Coffees are viewable by everyone"
  on public.coffees for select using (true);

create policy "Signed-in users can add coffees"
  on public.coffees for insert
  with check (auth.uid() = created_by);

create policy "Users can manage the coffees they added"
  on public.coffees for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Users can delete the coffees they added"
  on public.coffees for delete
  using (auth.uid() = created_by);

create policy "Admins can manage all coffees"
  on public.coffees for all
  using (public.is_admin())
  with check (public.is_admin());
