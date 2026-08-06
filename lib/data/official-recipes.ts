import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDbRecipeToListItem, RECIPE_SELECT } from "@/lib/data/db-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { DbRecipeRow, RecipeListItem } from "@/types/recipe";
import type {
  OfficialRecipeListFilters,
  OfficialRecipeSummary,
  RecipeKind,
  RecipeVerificationStatus,
} from "@/types/official-recipe";
import { isVerifiedOfficialRecipe } from "@/types/official-recipe";

const OFFICIAL_SUMMARY_SELECT = `
  id, title, slug, recipe_kind, verification_status, version_label,
  featured, premium_only, cover_image_url, difficulty, tasting_notes, serving_style, updated_at,
  brewing_methods ( name ),
  devices ( name ),
  coffees (
    roasters ( name ),
    origins ( country, region )
  )
`;

type OfficialSummaryRow = {
  id: string;
  title: string;
  slug: string;
  recipe_kind: RecipeKind;
  verification_status: RecipeVerificationStatus;
  version_label: string;
  featured: boolean;
  premium_only: boolean;
  cover_image_url: string | null;
  difficulty: string | null;
  tasting_notes: string | null;
  serving_style: "hot" | "iced";
  updated_at: string;
  brewing_methods: { name: string } | null;
  devices: { name: string } | null;
  coffees: {
    roasters: { name: string } | null;
    origins: { country: string; region: string } | null;
  } | null;
};

function mapOfficialSummary(row: OfficialSummaryRow): OfficialRecipeSummary {
  const origin = row.coffees?.origins;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    recipeKind: row.recipe_kind,
    verificationStatus: row.verification_status,
    versionLabel: row.version_label,
    featured: row.featured,
    premiumOnly: row.premium_only,
    coverImageUrl: row.cover_image_url,
    brewingMethodName: row.brewing_methods?.name ?? null,
    deviceName: row.devices?.name ?? null,
    originLabel: origin ? `${origin.region}, ${origin.country}` : null,
    roasterName: row.coffees?.roasters?.name ?? null,
    difficulty: row.difficulty,
    tastingNotes: row.tasting_notes,
    servingStyle: row.serving_style ?? "hot",
    updatedAt: row.updated_at,
  };
}

/** Published official library recipes for admin and public surfaces. */
export async function listOfficialRecipes(
  supabase: SupabaseClient,
  filters: OfficialRecipeListFilters = {},
  options: { limit?: number; offset?: number } = {},
): Promise<{ items: OfficialRecipeSummary[]; totalCount: number }> {
  const limit = options.limit ?? 24;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("recipes")
    .select(OFFICIAL_SUMMARY_SELECT, { count: "exact" })
    .eq("status", "published")
    .in("recipe_kind", filters.recipeKind ? [filters.recipeKind] : ["official", "competition"]);

  if (filters.verificationStatus) {
    query = query.eq("verification_status", filters.verificationStatus);
  }
  if (filters.verifiedOnly) {
    query = query.in("verification_status", ["verified", "competition_tested"]);
  }
  if (filters.featuredOnly) {
    query = query.eq("featured", true);
  }
  if (filters.brewingMethodId) {
    query = query.eq("brewing_method_id", filters.brewingMethodId);
  }
  if (filters.servingStyle) {
    query = query.eq("serving_style", filters.servingStyle);
  }
  if (filters.roasterId) {
    query = query.eq("roaster_id", filters.roasterId);
  }
  if (filters.difficulty) {
    query = query.eq("difficulty", filters.difficulty);
  }
  if (filters.search?.trim()) {
    query = query.ilike("title", `%${filters.search.trim()}%`);
  }
  if (filters.originId || filters.process) {
    query = query.not("coffee_id", "is", null);
  }

  const { data, error, count } = await query
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("listOfficialRecipes failed", error);
    return { items: [], totalCount: 0 };
  }

  let items = (data as unknown as OfficialSummaryRow[]).map(mapOfficialSummary);

  if (filters.originId || filters.process) {
    const ids = items.map((item) => item.id);
    if (ids.length > 0) {
      const { data: coffeeRows } = await supabase
        .from("recipes")
        .select("id, coffees ( origin_id, process )")
        .in("id", ids);

      const allowed = new Set(
        (coffeeRows ?? [])
          .filter((row) => {
            const coffee = row.coffees as {
              origin_id?: string | null;
              process?: string | null;
            } | null;
            if (!coffee) return false;
            if (filters.originId && coffee.origin_id !== filters.originId) return false;
            if (filters.process && coffee.process !== filters.process) return false;
            return true;
          })
          .map((row) => row.id as string),
      );
      items = items.filter((item) => allowed.has(item.id));
    }
  }

  return { items, totalCount: count ?? items.length };
}

/** Best official recipe matches for AI Coach — verified official recipes first. */
export async function findOfficialRecipesForCoach(
  supabase: SupabaseClient,
  input: {
    method?: string | null;
    process?: string | null;
    roastLevel?: string | null;
    flavorPreference?: string | null;
    limit?: number;
  },
): Promise<RecipeListItem[]> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const limit = input.limit ?? 3;

  const query = supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("status", "published")
    .eq("recipe_kind", "official")
    .in("verification_status", ["verified", "competition_tested"])
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(Math.max(limit * 4, 12));

  const { data, error } = await query;
  if (error || !data?.length) {
    return [];
  }

  let rows = data as unknown as DbRecipeRow[];
  const method = input.method?.trim().toLowerCase();
  if (method) {
    rows = rows.filter((row) => row.brewing_methods?.name?.toLowerCase().includes(method));
  }
  const flavor = input.flavorPreference?.toLowerCase() ?? "";
  const process = input.process?.toLowerCase() ?? "";
  const roast = input.roastLevel?.toLowerCase() ?? "";

  const scored = rows
    .map((row) => {
      let score = row.featured ? 2 : 0;
      if (isVerifiedOfficialRecipe(row.recipe_kind, row.verification_status)) score += 3;
      if (process && row.coffees?.process?.toLowerCase().includes(process)) score += 2;
      if (roast && row.coffees?.roast_level?.toLowerCase().includes(roast)) score += 2;
      if (flavor) {
        const haystack = [row.tasting_notes, row.description, row.title].join(" ").toLowerCase();
        if (haystack.includes(flavor)) score += 2;
      }
      return { row, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ row }) => mapDbRecipeToListItem(row, dictionary));
}

export function officialRecipeBoost(kind: RecipeKind, status: RecipeVerificationStatus): number {
  if (kind === "official" && status === "verified") return 0.15;
  if (kind === "official" && status === "competition_tested") return 0.2;
  if (kind === "competition") return 0.1;
  return 0;
}
