export type {
  PlaceholderFlavorProfile,
  PlaceholderRecipeDetail,
  PlaceholderRecipeStep,
} from "@/lib/gulf-directory/placeholder-recipe-types";

export {
  getPlaceholderRecipeDetail,
  listPlaceholderRecipeDetails,
} from "@/lib/gulf-directory/placeholder-library";

import { getCachedRecipeDetail } from "@/lib/data/cached-recipes";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";

/**
 * Preferred Gulf recipe loader for App Router pages.
 * Reads Supabase first, then falls back to TypeScript seeds.
 */
export async function getGulfRecipeDetailForPage(
  slug: string,
): Promise<PlaceholderRecipeDetail | null> {
  return getCachedRecipeDetail(slug);
}
