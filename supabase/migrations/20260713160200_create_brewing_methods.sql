-- brewing_methods: reference list of brewing methods (e.g. Pour Over,
-- French Press, Espresso). Public read, admin-only write.

create table public.brewing_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  icon text,
  created_at timestamptz not null default now(),
  constraint brewing_methods_slug_key unique (slug)
);

comment on table public.brewing_methods is
  'Reference list of brewing methods used by recipes.';

create index brewing_methods_name_idx on public.brewing_methods (name);

alter table public.brewing_methods enable row level security;

create policy "Brewing methods are viewable by everyone"
  on public.brewing_methods
  for select
  using (true);

create policy "Admins can manage brewing methods"
  on public.brewing_methods
  for all
  using (public.is_admin())
  with check (public.is_admin());
