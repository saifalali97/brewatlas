import type { FeatureKey, MembershipSummary } from "@/types/membership";

/**
 * Reusable, pure access-control helpers (requirement 5). Every helper
 * takes an already-resolved `MembershipSummary` (from
 * `lib/data/membership.ts`'s `getMembershipSummary`) rather than a
 * Supabase client -- keeping this module framework/IO-free so it can be
 * called from Server Components, Server Actions, or (once written)
 * Client Components fed a summary as a prop, without re-fetching.
 *
 * `summary: null` represents a guest (no authenticated user); every
 * helper treats that as "no access", so callers don't need to null
 * -check separately before gating.
 */

/** True if the user is on a paid, currently-active-or-trialing Premium (or higher) plan. Mirrors `MembershipSummary.isPremium`, computed once in `getMembershipSummary`. */
export function isPremium(summary: MembershipSummary | null): boolean {
  return summary?.isPremium ?? false;
}

/** True if `featureKey` is enabled for this user, resolved from their `feature_access` override or their plan's default (see `getMembershipSummary`). Unknown feature keys default to `false` ("off until explicitly granted"). */
export function hasFeature(summary: MembershipSummary | null, featureKey: FeatureKey): boolean {
  return summary?.features[featureKey] ?? false;
}

/** Whether a feature with a usage limit still has capacity for one more use (e.g. before creating another favorite/brew log/collection). Features with no limit (`limit: null`) are always allowed once enabled. */
export function hasRemainingUsage(summary: MembershipSummary | null, featureKey: FeatureKey): boolean {
  if (!summary) return false;
  const usage = summary.usage[featureKey];
  if (!usage || !usage.enabled) return false;
  return usage.limit === null || usage.remaining === null || usage.remaining > 0;
}

/** Gate for viewing a recipe's full content. Non-premium recipes are always accessible; `premium_only` recipes require an active Premium (or higher) membership. */
export function canAccessRecipe(summary: MembershipSummary | null, recipe: { premiumOnly: boolean }): boolean {
  if (!recipe.premiumOnly) return true;
  return isPremium(summary);
}

/** Gate for BrewAtlas AI Coach features (recommendations UI, AI-guided brewing, etc.). */
export function canUseAI(summary: MembershipSummary | null): boolean {
  return hasFeature(summary, "ai_coach");
}

/** Gate for creating a new recipe collection: the feature must be enabled for the plan, and the user must not already be at their `recipe_collections` usage limit (Free is capped; Premium/Enterprise are unlimited). `currentCount` lets a caller pass a live count instead of relying on `feature_access.usage_count`, which is only updated where explicitly tracked. */
export function canCreateCollection(summary: MembershipSummary | null, currentCount?: number): boolean {
  if (!hasFeature(summary, "recipe_collections")) return false;
  const usage = summary?.usage.recipe_collections;
  const limit = usage?.limit ?? null;
  if (limit === null) return true;
  const used = currentCount ?? usage?.used ?? 0;
  return used < limit;
}
