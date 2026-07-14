/**
 * Normalizes a value from a Supabase/PostgREST embed into a plain array.
 *
 * Embedded relationships can come back in more shapes than their declared
 * TypeScript type admits: a genuine to-many embed is normally `[]`/`T[]`,
 * but a to-one embed (inferred when the foreign key has a `unique`
 * constraint, e.g. `xbloom_profiles.recipe_id`) comes back as a single
 * object or `null` instead of an array -- and any embed can end up
 * `null`/`undefined` on rows fetched through joins, RLS-filtered relations,
 * or hand-built test fixtures. Always returns a fresh array, so callers can
 * freely `.sort()`/mutate the result without touching the original data.
 */
export function toSafeArray<T>(value: T[] | T | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? [...value] : [value];
}
