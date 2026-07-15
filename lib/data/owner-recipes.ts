import type { SupabaseClient } from "@supabase/supabase-js";

export const OWNER_RECIPE_PAGE_SIZE = 12;

export const OWNER_RECIPE_LIST_SELECT = `
  id, title, slug, published, featured, cover_image_url, created_at, updated_at,
  brewing_methods ( name ),
  devices ( name ),
  coffees ( origins ( country, region ) ),
  profiles:author_id ( full_name )
`;

type OwnerRecipeListRow = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  brewing_methods: { name: string } | null;
  devices: { name: string } | null;
  coffees: { origins: { country: string; region: string } | null } | null;
  profiles: { full_name: string | null } | null;
};

export type OwnerRecipeListItem = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  brewingMethodName: string | null;
  deviceName: string | null;
  originLabel: string | null;
  authorName: string | null;
};

export type OwnerRecipeFilters = {
  search?: string;
  brewingMethodId?: string;
  deviceId?: string;
  originId?: string;
  published?: boolean;
  page?: number;
};

export type OwnerRecipesPageResult = {
  items: OwnerRecipeListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

function mapOwnerRecipeRow(row: OwnerRecipeListRow): OwnerRecipeListItem {
  const origin = row.coffees?.origins;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    published: row.published,
    featured: row.featured,
    coverImageUrl: row.cover_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    brewingMethodName: row.brewing_methods?.name ?? null,
    deviceName: row.devices?.name ?? null,
    originLabel: origin ? `${origin.region}, ${origin.country}` : null,
    authorName: row.profiles?.full_name ?? null,
  };
}

export async function getOwnerRecipesPage(
  supabase: SupabaseClient,
  filters: OwnerRecipeFilters = {},
): Promise<OwnerRecipesPageResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = OWNER_RECIPE_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  const originFilter = Boolean(filters.originId);
  const select = originFilter
    ? OWNER_RECIPE_LIST_SELECT.replace("coffees (", "coffees!inner (")
    : OWNER_RECIPE_LIST_SELECT;

  let query = supabase.from("recipes").select(select, { count: "exact" });

  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }
  if (filters.brewingMethodId) {
    query = query.eq("brewing_method_id", filters.brewingMethodId);
  }
  if (filters.deviceId) {
    query = query.eq("device_id", filters.deviceId);
  }
  if (filters.originId) {
    query = query.eq("coffees.origin_id", filters.originId);
  }
  if (filters.published !== undefined) {
    query = query.eq("published", filters.published);
  }

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getOwnerRecipesPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data as unknown as OwnerRecipeListRow[]).map(mapOwnerRecipeRow),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

export type OwnerRecipeFilterOptions = {
  brewingMethods: { id: string; name: string }[];
  devices: { id: string; name: string }[];
  origins: { id: string; name: string }[];
};

export async function getOwnerRecipeFilterOptions(supabase: SupabaseClient): Promise<OwnerRecipeFilterOptions> {
  const [{ data: brewingMethods }, { data: devices }, { data: origins }] = await Promise.all([
    supabase.from("brewing_methods").select("id, name").order("name"),
    supabase.from("devices").select("id, name").order("name"),
    supabase.from("origins").select("id, country, region").order("country"),
  ]);

  return {
    brewingMethods: brewingMethods ?? [],
    devices: devices ?? [],
    origins: (origins ?? []).map((row) => ({
      id: row.id as string,
      name: `${row.region as string}, ${row.country as string}`,
    })),
  };
}

export async function getOwnerRecipeVersionCount(supabase: SupabaseClient, recipeId: string): Promise<number> {
  const { count, error } = await supabase
    .from("recipe_versions")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);

  if (error) return 0;
  return count ?? 0;
}

export async function buildRecipeVersionSnapshot(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<Record<string, unknown>> {
  const { data } = await supabase
    .from("recipes")
    .select(
      `
      *,
      recipe_pours ( * ),
      recipe_images ( * ),
      recipe_tags ( tag_id )
    `,
    )
    .eq("id", recipeId)
    .maybeSingle();

  return { recipe: data ?? null, capturedAt: new Date().toISOString() };
}
