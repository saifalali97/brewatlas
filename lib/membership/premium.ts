import type { MembershipSummary } from "@/types/membership";
import { canAccessRecipe, isPremium } from "@/lib/membership/access";

export { isPremium, canAccessRecipe, hasFeature, canUseAI, canCreateCollection, hasRemainingUsage } from "@/lib/membership/access";

/** Maximum recipes visible to unauthenticated guests in the library. */
export const GUEST_RECIPE_LIMIT = 3;

/** True when the user has an active Premium (or higher) subscription. */
export function hasPremiumAccess(summary: MembershipSummary | null): boolean {
  return isPremium(summary);
}

/** Whether a guest may browse a recipe at the given position in the canonical library order (0-based). */
export function isGuestRecipeIndexVisible(index: number): boolean {
  return index >= 0 && index < GUEST_RECIPE_LIMIT;
}

/** Resolves a recipe slug to its index in the canonical library list, or -1 if missing. */
export function getRecipeIndexBySlug(recipes: ReadonlyArray<{ slug: string }>, slug: string): number {
  return recipes.findIndex((recipe) => recipe.slug === slug);
}

/** Whether an unauthenticated guest may view full recipe content. */
export function canGuestAccessRecipe(
  recipes: ReadonlyArray<{ slug: string; premiumOnly?: boolean }>,
  slug: string,
): boolean {
  const recipe = recipes.find((entry) => entry.slug === slug);
  if (!recipe) return false;
  if (recipe.premiumOnly) return false;

  const index = getRecipeIndexBySlug(recipes, slug);
  return isGuestRecipeIndexVisible(index);
}

/**
 * Full recipe content gate: premium recipes require Premium; guests are capped
 * at {@link GUEST_RECIPE_LIMIT} non-premium recipes in canonical library order.
 */
export function canAccessFullRecipeContent(
  summary: MembershipSummary | null,
  recipe: { premiumOnly: boolean },
  options?: { guestRecipeIndex?: number },
): boolean {
  if (!canAccessRecipe(summary, recipe)) return false;

  if (summary) return true;

  if (recipe.premiumOnly) return false;

  const index = options?.guestRecipeIndex;
  if (index === undefined) return true;

  return isGuestRecipeIndexVisible(index);
}

/** Slice recipes for guest listing views. Premium users and signed-in users receive the full list. */
export function getVisibleRecipesForUser<T extends { premiumOnly?: boolean }>(
  recipes: T[],
  summary: MembershipSummary | null,
  isAuthenticated: boolean,
): T[] {
  if (isPremium(summary) || isAuthenticated) return recipes;
  return recipes.slice(0, GUEST_RECIPE_LIMIT);
}

/** Number of recipes hidden from the current viewer (for upgrade messaging). */
export function getHiddenRecipeCount(
  totalCount: number,
  summary: MembershipSummary | null,
  isAuthenticated: boolean,
): number {
  if (isPremium(summary) || isAuthenticated) return 0;
  return Math.max(0, totalCount - GUEST_RECIPE_LIMIT);
}
