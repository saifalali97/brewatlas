-- Brew Sessions: production brewing journal with steps, photos, tags, and AI analysis.

create table public.brew_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  recipe_id uuid references public.recipes (id) on delete set null,
  coffee_name text,
  roaster text,
  origin text,
  roast_level text,
  processing text,
  brew_method text,
  grinder text,
  brewer text,
  kettle text,
  filter text,
  grinder_setting text,
  dose numeric,
  water numeric,
  ratio text,
  temperature numeric,
  bloom_time text,
  brew_time text,
  yield numeric,
  tds numeric,
  extraction_yield numeric,
  notes text,
  rating smallint check (rating is null or (rating >= 1 and rating <= 5)),
  favorite boolean not null default false,
  search_document tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(coffee_name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(roaster, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(origin, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(notes, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(brew_method, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(grinder, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(brewer, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.brew_sessions is
  'User brewing journal — permanent record of every brew with equipment, parameters, and outcomes.';

create table public.brew_session_steps (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.brew_sessions (id) on delete cascade,
  step_number integer not null check (step_number >= 1),
  action text not null,
  water_added numeric,
  duration text,
  notes text,
  unique (session_id, step_number)
);

comment on table public.brew_session_steps is 'Pour structure and timeline steps for a brew session.';

create table public.brew_session_photos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.brew_sessions (id) on delete cascade,
  image_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table public.brew_session_tags (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.brew_sessions (id) on delete cascade,
  tag text not null check (char_length(btrim(tag)) > 0),
  unique (session_id, tag)
);

create table public.brew_session_ai_analysis (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.brew_sessions (id) on delete cascade,
  summary text not null,
  strengths text not null,
  weaknesses text not null,
  recommendations text not null,
  created_at timestamptz not null default now()
);

comment on table public.brew_session_ai_analysis is
  'Cached AI Coach analysis for a brew session — regenerated on demand.';

-- Indexes
create index brew_sessions_user_id_idx on public.brew_sessions (user_id);
create index brew_sessions_user_created_idx on public.brew_sessions (user_id, created_at desc);
create index brew_sessions_user_favorite_idx on public.brew_sessions (user_id, favorite) where favorite = true;
create index brew_sessions_user_rating_idx on public.brew_sessions (user_id, rating desc nulls last);
create index brew_sessions_recipe_id_idx on public.brew_sessions (recipe_id) where recipe_id is not null;
create index brew_sessions_brew_method_idx on public.brew_sessions (user_id, brew_method);
create index brew_sessions_origin_idx on public.brew_sessions (user_id, origin);
create index brew_sessions_roaster_idx on public.brew_sessions (user_id, roaster);
create index brew_sessions_search_idx on public.brew_sessions using gin (search_document);
create index brew_session_steps_session_idx on public.brew_session_steps (session_id, step_number);
create index brew_session_photos_session_idx on public.brew_session_photos (session_id);
create index brew_session_tags_session_idx on public.brew_session_tags (session_id);
create index brew_session_tags_tag_idx on public.brew_session_tags (tag);
create index brew_session_ai_analysis_session_idx on public.brew_session_ai_analysis (session_id, created_at desc);

create trigger brew_sessions_set_updated_at
  before update on public.brew_sessions
  for each row execute function public.set_updated_at();

-- RLS
alter table public.brew_sessions enable row level security;
alter table public.brew_session_steps enable row level security;
alter table public.brew_session_photos enable row level security;
alter table public.brew_session_tags enable row level security;
alter table public.brew_session_ai_analysis enable row level security;

create policy "Users manage own brew sessions"
  on public.brew_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins manage all brew sessions"
  on public.brew_sessions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users manage own session steps"
  on public.brew_session_steps for all
  using (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "Admins manage all session steps"
  on public.brew_session_steps for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users manage own session photos"
  on public.brew_session_photos for all
  using (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "Admins manage all session photos"
  on public.brew_session_photos for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users manage own session tags"
  on public.brew_session_tags for all
  using (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "Admins manage all session tags"
  on public.brew_session_tags for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users manage own session ai analysis"
  on public.brew_session_ai_analysis for all
  using (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.brew_sessions s where s.id = session_id and s.user_id = auth.uid()));

create policy "Admins manage all session ai analysis"
  on public.brew_session_ai_analysis for all
  using (public.is_admin())
  with check (public.is_admin());

-- Search + list RPC (paginated, filtered, no N+1 on list)
create or replace function public.search_brew_sessions(
  p_user_id uuid,
  p_query text default null,
  p_method text default null,
  p_origin text default null,
  p_roaster text default null,
  p_rating integer default null,
  p_favorite boolean default null,
  p_date_from timestamptz default null,
  p_date_to timestamptz default null,
  p_sort text default 'newest',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  user_id uuid,
  recipe_id uuid,
  recipe_title text,
  recipe_slug text,
  coffee_name text,
  roaster text,
  origin text,
  roast_level text,
  processing text,
  brew_method text,
  grinder text,
  brewer text,
  rating smallint,
  favorite boolean,
  dose numeric,
  water numeric,
  ratio text,
  temperature numeric,
  yield numeric,
  created_at timestamptz,
  tag_count bigint,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_total bigint;
begin
  if auth.uid() is distinct from p_user_id and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select count(*) into v_total
  from public.brew_sessions s
  where s.user_id = p_user_id
    and (p_method is null or s.brew_method ilike p_method)
    and (p_origin is null or s.origin ilike p_origin)
    and (p_roaster is null or s.roaster ilike p_roaster)
    and (p_rating is null or s.rating = p_rating)
    and (p_favorite is null or s.favorite = p_favorite)
    and (p_date_from is null or s.created_at >= p_date_from)
    and (p_date_to is null or s.created_at <= p_date_to)
    and (
      p_query is null or btrim(p_query) = ''
      or s.search_document @@ plainto_tsquery('simple', p_query)
      or exists (
        select 1 from public.brew_session_tags t
        where t.session_id = s.id and t.tag ilike '%' || p_query || '%'
      )
    );

  return query
  select
    s.id,
    s.user_id,
    s.recipe_id,
    r.title as recipe_title,
    r.slug as recipe_slug,
    s.coffee_name,
    s.roaster,
    s.origin,
    s.roast_level,
    s.processing,
    s.brew_method,
    s.grinder,
    s.brewer,
    s.rating,
    s.favorite,
    s.dose,
    s.water,
    s.ratio,
    s.temperature,
    s.yield,
    s.created_at,
    (select count(*) from public.brew_session_tags t where t.session_id = s.id) as tag_count,
    v_total as total_count
  from public.brew_sessions s
  left join public.recipes r on r.id = s.recipe_id
  where s.user_id = p_user_id
    and (p_method is null or s.brew_method ilike p_method)
    and (p_origin is null or s.origin ilike p_origin)
    and (p_roaster is null or s.roaster ilike p_roaster)
    and (p_rating is null or s.rating = p_rating)
    and (p_favorite is null or s.favorite = p_favorite)
    and (p_date_from is null or s.created_at >= p_date_from)
    and (p_date_to is null or s.created_at <= p_date_to)
    and (
      p_query is null or btrim(p_query) = ''
      or s.search_document @@ plainto_tsquery('simple', p_query)
      or exists (
        select 1 from public.brew_session_tags t
        where t.session_id = s.id and t.tag ilike '%' || p_query || '%'
      )
    )
  order by
    case when p_sort = 'oldest' then s.created_at end asc,
    case when p_sort = 'highest_rated' then s.rating end desc nulls last,
    case when p_sort = 'most_brewed' then s.coffee_name end asc,
    s.created_at desc
  limit greatest(p_limit, 1)
  offset greatest(p_offset, 0);
end;
$$;

revoke all on function public.search_brew_sessions(uuid, text, text, text, text, integer, boolean, timestamptz, timestamptz, text, integer, integer) from public;
grant execute on function public.search_brew_sessions(uuid, text, text, text, text, integer, boolean, timestamptz, timestamptz, text, integer, integer) to authenticated;

-- User analytics RPC
create or replace function public.brew_session_user_analytics(p_user_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is distinct from p_user_id and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select jsonb_build_object(
    'brewsThisWeek', (
      select count(*) from public.brew_sessions
      where user_id = p_user_id and created_at >= date_trunc('week', now())
    ),
    'brewsThisMonth', (
      select count(*) from public.brew_sessions
      where user_id = p_user_id and created_at >= date_trunc('month', now())
    ),
    'averageRating', (
      select round(avg(rating)::numeric, 2) from public.brew_sessions
      where user_id = p_user_id and rating is not null
    ),
    'favoriteMethod', (
      select brew_method from public.brew_sessions
      where user_id = p_user_id and brew_method is not null
      group by brew_method order by count(*) desc limit 1
    ),
    'favoriteBrewer', (
      select brewer from public.brew_sessions
      where user_id = p_user_id and brewer is not null
      group by brewer order by count(*) desc limit 1
    ),
    'favoriteGrinder', (
      select grinder from public.brew_sessions
      where user_id = p_user_id and grinder is not null
      group by grinder order by count(*) desc limit 1
    ),
    'favoriteOrigin', (
      select origin from public.brew_sessions
      where user_id = p_user_id and origin is not null
      group by origin order by count(*) desc limit 1
    ),
    'averageRatio', (
      select mode() within group (order by ratio) from public.brew_sessions
      where user_id = p_user_id and ratio is not null
    ),
    'averageTemperature', (
      select round(avg(temperature)::numeric, 1) from public.brew_sessions
      where user_id = p_user_id and temperature is not null
    ),
    'mostBrewedCoffee', (
      select coffee_name from public.brew_sessions
      where user_id = p_user_id and coffee_name is not null
      group by coffee_name order by count(*) desc limit 1
    ),
    'longestStreak', (
      with days as (
        select distinct date_trunc('day', created_at)::date as brew_day
        from public.brew_sessions where user_id = p_user_id
      ),
      grouped as (
        select brew_day, brew_day - (row_number() over (order by brew_day))::integer as grp
        from days
      )
      select coalesce(max(cnt), 0) from (
        select count(*) as cnt from grouped group by grp
      ) streaks
    ),
    'recentBrews', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select id, coffee_name, brew_method, rating, favorite, created_at
        from public.brew_sessions
        where user_id = p_user_id
        order by created_at desc limit 5
      ) r
    ),
    'bestBrew', (
      select row_to_json(r) from (
        select id, coffee_name, rating, brew_method, created_at
        from public.brew_sessions
        where user_id = p_user_id and rating is not null
        order by rating desc, created_at desc limit 1
      ) r
    ),
    'favoriteCoffee', (
      select coffee_name from public.brew_sessions
      where user_id = p_user_id and favorite = true and coffee_name is not null
      order by created_at desc limit 1
    ),
    'currentStreak', 0
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.brew_session_user_analytics(uuid) from public;
grant execute on function public.brew_session_user_analytics(uuid) to authenticated;

-- Recipe brew stats for signed-in user
create or replace function public.brew_session_recipe_stats(p_user_id uuid, p_recipe_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'sessionCount', count(*),
    'averageRating', round(avg(rating)::numeric, 2),
    'mostRecent', (
      select row_to_json(r) from (
        select id, rating, notes, created_at
        from public.brew_sessions
        where user_id = p_user_id and recipe_id = p_recipe_id
        order by created_at desc limit 1
      ) r
    ),
    'recentSessions', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select id, rating, notes, brew_method, created_at
        from public.brew_sessions
        where user_id = p_user_id and recipe_id = p_recipe_id
        order by created_at desc limit 5
      ) r
    )
  )
  from public.brew_sessions
  where user_id = p_user_id and recipe_id = p_recipe_id
  and (auth.uid() = p_user_id or public.is_admin());
$$;

revoke all on function public.brew_session_recipe_stats(uuid, uuid) from public;
grant execute on function public.brew_session_recipe_stats(uuid, uuid) to authenticated;

-- Admin anonymous analytics (no notes, no private content)
create or replace function public.admin_brew_session_analytics(p_limit integer default 10)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'totalSessions', (select count(*) from public.brew_sessions),
    'popularMethods', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select brew_method as name, count(*)::bigint as count
        from public.brew_sessions where brew_method is not null
        group by brew_method order by count(*) desc limit greatest(p_limit, 1)
      ) r
    ),
    'popularBrewers', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select brewer as name, count(*)::bigint as count
        from public.brew_sessions where brewer is not null
        group by brewer order by count(*) desc limit greatest(p_limit, 1)
      ) r
    ),
    'popularGrinders', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select grinder as name, count(*)::bigint as count
        from public.brew_sessions where grinder is not null
        group by grinder order by count(*) desc limit greatest(p_limit, 1)
      ) r
    ),
    'popularOrigins', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select origin as name, count(*)::bigint as count
        from public.brew_sessions where origin is not null
        group by origin order by count(*) desc limit greatest(p_limit, 1)
      ) r
    ),
    'popularRecipes', (
      select coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb) from (
        select r.title as name, count(*)::bigint as count
        from public.brew_sessions s
        join public.recipes r on r.id = s.recipe_id
        group by r.title order by count(*) desc limit greatest(p_limit, 1)
      ) r
    )
  )
  where public.is_admin();
$$;

revoke all on function public.admin_brew_session_analytics(integer) from public;
grant execute on function public.admin_brew_session_analytics(integer) to authenticated;
