-- Phase 21.3: Recipe publishing workflow, scheduling, and normalized version history.

create type public.recipe_publish_status as enum (
  'draft',
  'published',
  'archived',
  'scheduled'
);

alter table public.recipes
  add column if not exists status public.recipe_publish_status not null default 'draft',
  add column if not exists scheduled_publish_at timestamptz,
  add column if not exists archived_at timestamptz;

comment on column public.recipes.status is
  'CMS lifecycle: draft, published, archived, or scheduled for future publish.';
comment on column public.recipes.scheduled_publish_at is
  'When status = scheduled, the recipe becomes published at or after this timestamp.';
comment on column public.recipes.archived_at is
  'Timestamp when the recipe was archived (status = archived).';

update public.recipes
set status = 'published'
where published = true and status = 'draft';

update public.recipes
set status = 'draft'
where published = false and status = 'draft';

create index if not exists recipes_status_idx on public.recipes (status);
create index if not exists recipes_scheduled_publish_at_idx
  on public.recipes (scheduled_publish_at)
  where status = 'scheduled';

-- Promote due scheduled recipes to published.
create or replace function public.process_scheduled_recipe_publishes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  promoted integer;
begin
  update public.recipes
  set
    status = 'published',
    published = true,
    scheduled_publish_at = null
  where status = 'scheduled'
    and scheduled_publish_at is not null
    and scheduled_publish_at <= now();

  get diagnostics promoted = row_count;
  return promoted;
end;
$$;

comment on function public.process_scheduled_recipe_publishes() is
  'Promotes scheduled recipes whose publish time has passed. Returns rows updated.';

grant execute on function public.process_scheduled_recipe_publishes() to authenticated;
grant execute on function public.process_scheduled_recipe_publishes() to anon;

-- Keep legacy `published` boolean in sync with CMS status for backwards compatibility.
create or replace function public.sync_recipe_publish_state()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status or new.scheduled_publish_at is distinct from old.scheduled_publish_at then
    if new.status = 'published' then
      new.published := true;
      new.scheduled_publish_at := null;
      new.archived_at := null;
    elsif new.status = 'archived' then
      new.published := false;
      new.scheduled_publish_at := null;
      if new.archived_at is null then
        new.archived_at := now();
      end if;
    elsif new.status = 'scheduled' then
      new.published := false;
      new.archived_at := null;
      if new.scheduled_publish_at is not null and new.scheduled_publish_at <= now() then
        new.status := 'published';
        new.published := true;
        new.scheduled_publish_at := null;
      end if;
    else
      new.published := false;
      new.scheduled_publish_at := null;
      new.archived_at := null;
    end if;
  elsif new.published is distinct from old.published then
    if new.published then
      new.status := 'published';
      new.scheduled_publish_at := null;
      new.archived_at := null;
    elsif new.status = 'published' then
      new.status := 'draft';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists recipes_sync_publish_state on public.recipes;

create trigger recipes_sync_publish_state
  before insert or update on public.recipes
  for each row
  execute function public.sync_recipe_publish_state();

drop policy if exists "Published recipes are viewable by everyone" on public.recipes;

create policy "Published recipes are viewable by everyone"
  on public.recipes
  for select
  using (
    status = 'published'
    or (
      status = 'scheduled'
      and scheduled_publish_at is not null
      and scheduled_publish_at <= now()
    )
  );

-- Normalize version history columns (snapshot retained for full restore).
alter table public.recipe_versions
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text,
  add column if not exists author_id uuid references public.profiles (id) on delete set null,
  add column if not exists status public.recipe_publish_status,
  add column if not exists scheduled_publish_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.recipe_versions.metadata is
  'Normalized brew parameters, tags, pours, and workflow fields at capture time.';

create index if not exists recipe_versions_created_at_idx
  on public.recipe_versions (recipe_id, created_at desc);
