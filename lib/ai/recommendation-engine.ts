import { tasteSimilarity } from "@/lib/ai/similarity-engine";
import type { RecommendationBreakdown, RecipeRecommendationScore, SensoryVector } from "@/types/ai";

/**
 * The BrewAtlas AI Recommendation Engine: a pure, deterministic, weighted
 * scoring function combining sensory taste similarity with every
 * categorical preference signal requested for BrewAtlas AI (favorite
 * coffees/origins, roast preference, brewing method, grinder, brewer,
 * xBloom ownership, previous brews, ratings, saved recipes, tasting
 * profile, extraction history, difficulty preference).
 *
 * No I/O -- `lib/data/ai.ts` builds the `RecommendationContext` and
 * `RecipeCandidate` inputs from the database and merges the resulting
 * scores with recipe display metadata.
 */

/** Relative weight (0-100, summing to 100) of each signal in the final recommendation score. */
export const RECOMMENDATION_WEIGHTS: Record<keyof RecommendationBreakdown, number> = {
  sensorySimilarity: 32,
  originMatch: 12,
  roastMatch: 8,
  processMatch: 8,
  brewingMethodMatch: 10,
  grinderMatch: 6,
  brewerMatch: 6,
  xbloomMatch: 8,
  difficultyMatch: 5,
  ratingHistoryBoost: 5,
};

/** Everything the Recommendation Engine knows about a user, distilled from their AI User Profile + live behavioral context. */
export type RecommendationContext = {
  vector: SensoryVector;
  preferredOriginIds: Set<string>;
  preferredProcesses: Set<string>;
  preferredRoast: string | null;
  preferredBrewingMethodIds: Set<string>;
  preferredGrinderId: string | null;
  preferredDeviceId: string | null;
  ownsXbloom: boolean;
  preferredDifficulty: string | null;
  /** Origins the user has rated highly (>=4) in brew logs/reviews -- a stronger, more specific signal than `preferredOriginIds` alone. */
  highlyRatedOriginIds: Set<string>;
};

/** Everything the Recommendation Engine needs about one candidate recipe. */
export type RecipeCandidate = {
  recipeId: string;
  vector: SensoryVector;
  originId: string | null;
  process: string | null;
  roastLevel: string | null;
  brewingMethodId: string | null;
  grinderId: string | null;
  deviceId: string | null;
  hasXbloomProfile: boolean;
  difficultyLabel: string | null;
  officialBoost?: number;
};

function roastMatches(preferredRoast: string | null, candidateRoastLevel: string | null): boolean {
  if (!preferredRoast || !candidateRoastLevel) return false;
  return candidateRoastLevel.toLowerCase().includes(preferredRoast.toLowerCase());
}

/** Scores one candidate recipe for a user, returning the total score (0-100), its per-signal breakdown, and human-readable reasons. */
export function scoreRecipeForUser(context: RecommendationContext, candidate: RecipeCandidate): RecipeRecommendationScore {
  const breakdown: RecommendationBreakdown = {
    sensorySimilarity: tasteSimilarity(context.vector, candidate.vector),
    originMatch: candidate.originId
      ? context.highlyRatedOriginIds.has(candidate.originId)
        ? 1
        : context.preferredOriginIds.has(candidate.originId)
          ? 0.6
          : 0
      : 0,
    roastMatch: roastMatches(context.preferredRoast, candidate.roastLevel) ? 1 : 0,
    processMatch: candidate.process && context.preferredProcesses.has(candidate.process) ? 1 : 0,
    brewingMethodMatch: candidate.brewingMethodId && context.preferredBrewingMethodIds.has(candidate.brewingMethodId) ? 1 : 0,
    grinderMatch: candidate.grinderId && candidate.grinderId === context.preferredGrinderId ? 1 : 0,
    brewerMatch: candidate.deviceId && candidate.deviceId === context.preferredDeviceId ? 1 : 0,
    xbloomMatch: context.ownsXbloom && candidate.hasXbloomProfile ? 1 : 0,
    difficultyMatch:
      context.preferredDifficulty && candidate.difficultyLabel && context.preferredDifficulty === candidate.difficultyLabel
        ? 1
        : 0,
    // Recommending recipes similar in style to ones the user already
    // brews (proxied by origin/roast match feeding into sensory
    // similarity already) gets a small extra nudge here specifically for
    // users with real brewing history, vs. a brand new account.
    ratingHistoryBoost: context.highlyRatedOriginIds.size > 0 ? 0.5 : 0,
  };

  const score = (Object.keys(RECOMMENDATION_WEIGHTS) as (keyof RecommendationBreakdown)[]).reduce(
    (sum, signal) => sum + breakdown[signal] * RECOMMENDATION_WEIGHTS[signal],
    0,
  ) + (candidate.officialBoost ?? 0) * 100;

  const reasons: string[] = [];
  if ((candidate.officialBoost ?? 0) > 0) reasons.push("BrewAtlas official recipe");
  if (breakdown.originMatch > 0) reasons.push("Matches an origin you love");
  if (breakdown.roastMatch > 0) reasons.push("Matches your roast preference");
  if (breakdown.processMatch > 0) reasons.push("Uses a processing method you favor");
  if (breakdown.brewingMethodMatch > 0) reasons.push("Uses a brewing method you use often");
  if (breakdown.grinderMatch > 0) reasons.push("Dialed in for your grinder");
  if (breakdown.brewerMatch > 0) reasons.push("Dialed in for your brewer");
  if (breakdown.xbloomMatch > 0) reasons.push("Has an xBloom profile for your device");
  if (breakdown.difficultyMatch > 0) reasons.push("Matches your preferred difficulty");
  if (breakdown.sensorySimilarity >= 0.75) reasons.push("Very close to your taste profile");

  return {
    recipeId: candidate.recipeId,
    score: Math.round(Math.min(100, score) * 10) / 10,
    breakdown,
    reasons,
  };
}

/** Scores and ranks every candidate for a user, highest score first. */
export function rankRecommendations(
  context: RecommendationContext,
  candidates: RecipeCandidate[],
  limit = 10,
): RecipeRecommendationScore[] {
  return candidates
    .map((candidate) => scoreRecipeForUser(context, candidate))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
