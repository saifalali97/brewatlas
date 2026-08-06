-- Gulf Recipe Library prep: archive the current official seed/editorial library.
--
-- Safe, non-destructive migration:
--   - Rows are retained (no deletes)
--   - Recipe content is not modified
--   - Foreign keys, favorites, reviews, and slugs remain intact
--   - Public listings/search/AI Coach exclude archived recipes via status filters
--
-- Scope: recipe_kind = 'official' only.
-- Excludes: community, imported, competition, and user-authored recipes.

do $$
declare
  archived_count integer;
begin
  update public.recipes
  set
    status = 'archived',
    published = false,
    archived_at = now()
  where recipe_kind = 'official'
    and published is true
    and status = 'published';

  get diagnostics archived_count = row_count;

  raise notice
    'Gulf Recipe Library prep: archived % official recipe(s) (status=archived, published=false).',
    archived_count;
end;
$$;
