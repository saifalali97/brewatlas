import { NEUTRAL_SENSORY_VECTOR, SENSORY_VECTOR_DIMENSIONS, type SensoryVector } from "@/types/ai";

/**
 * Pure, deterministic feature-vector builders for BrewAtlas AI. No I/O, no
 * Supabase, no Next.js -- mirrors `lib/intelligence/recipe-analysis.ts`.
 * These turn raw recipe/coffee/behavioral data into the fixed-shape,
 * normalized (0-1) `SensoryVector` used by the Taste Similarity Engine,
 * the Recommendation Engine, and the AI User Profile alike.
 *
 * The heuristics below (tag/process/roast -> flavor dimension) are a
 * rule-based approximation, the same spirit as the Recipe Intelligence
 * Engine's expected sensory profile -- good enough to power real
 * recommendations today, and easy to keep or discard once real
 * embeddings (see `lib/ai/llm-adapter.ts`) are available.
 */

export const ENGINE_VERSION = "1.0";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Scales a 1-10 score to 0-1, falling back to the neutral midpoint (0.5) when unset. */
function fromTenScale(value: number | null | undefined, fallback = 0.5): number {
  if (value === null || value === undefined) return fallback;
  return clamp01(value / 10);
}

/** Maps a free-text roast descriptor to 0 (lightest) - 1 (darkest), defaulting to the medium midpoint. */
export function roastToNormalized(roastLevel: string | null): number {
  if (!roastLevel) return 0.5;
  const roast = roastLevel.toLowerCase();
  if (roast.includes("light") && roast.includes("medium")) return 0.35;
  if (roast.includes("medium") && roast.includes("dark")) return 0.65;
  if (roast.includes("light")) return 0.1;
  if (roast.includes("dark")) return 0.9;
  if (roast.includes("medium")) return 0.5;
  return 0.5;
}

/** Maps a free-text process descriptor to a "fermented/funky" intensity, defaulting to a light-fermentation baseline. */
export function processToFermented(process: string | null): number {
  if (!process) return 0.4;
  const value = process.toLowerCase();
  if (value.includes("anaerobic") || value.includes("carbonic")) return 0.95;
  if (value.includes("natural")) return 0.8;
  if (value.includes("honey") || value.includes("pulped")) return 0.5;
  if (value.includes("washed")) return 0.15;
  return 0.4;
}

const SPICE_KEYWORDS = /cinnamon|clove|cardamom|spice|spiced|nutmeg|allspice|baking spice/i;

/** Estimates a "spice" note from free-text tasting notes, with a small dark-roast baseline bump. */
export function estimateSpice(tastingNotes: string | null, roastLevel: string | null): number {
  let score = 0.25;
  if (roastToNormalized(roastLevel) >= 0.65) score += 0.15;
  if (tastingNotes && SPICE_KEYWORDS.test(tastingNotes)) score = Math.max(score, 0.8);
  return clamp01(score);
}

/**
 * Origin-country heuristic fallback for the tag-driven flavor dimensions
 * (floral/fruity/chocolate/nutty), used only when a recipe has no
 * matching flavor tag to read from directly. Mirrors the same
 * origin -> flavor associations used when seeding demo recipes
 * (see supabase/migrations/20260713200600_seed_recipes.sql).
 */
const ORIGIN_FLAVOR_BIAS: Record<string, Partial<Pick<SensoryVector, "floral" | "fruity" | "chocolate" | "nutty">>> = {
  ethiopia: { floral: 0.75, fruity: 0.8 },
  kenya: { fruity: 0.75 },
  panama: { floral: 0.8, fruity: 0.5 },
  rwanda: { fruity: 0.6 },
  yemen: { fruity: 0.65 },
  colombia: { chocolate: 0.55, fruity: 0.5 },
  brazil: { chocolate: 0.75, nutty: 0.65 },
  guatemala: { chocolate: 0.7, nutty: 0.5 },
  indonesia: { chocolate: 0.6, nutty: 0.4 },
  "costa rica": { chocolate: 0.5, fruity: 0.45 },
};

const TAG_DIMENSIONS: Partial<Record<string, keyof SensoryVector>> = {
  floral: "floral",
  fruity: "fruity",
  chocolate: "chocolate",
  nutty: "nutty",
};

/** Plain input for `buildRecipeSensoryVector`, sourced from `recipes`/`coffees`/`recipe_insights`/`recipe_tags`. */
export type RecipeFeatureVectorInput = {
  /** User-entered actual results (recipes.acidity/sweetness/body/bitterness), preferred over predictions when present. */
  acidity: number | null;
  sweetness: number | null;
  body: number | null;
  bitterness: number | null;
  /** Recipe Intelligence Engine predictions (recipe_insights.expected_*), used as a fallback. */
  expectedAcidity: number | null;
  expectedSweetness: number | null;
  expectedBody: number | null;
  expectedClarity: number | null;
  roastLevel: string | null;
  process: string | null;
  originCountry: string | null;
  tagNames: string[];
  tastingNotes: string | null;
  brewRatioValue: number | null;
  extractionPercentage: number | null;
  difficultyScore: number | null;
  difficultyLabel: string | null;
};

/** Normalizes a brew ratio (water:coffee, e.g. 16.2) to 0 (strongest, ~1:6) - 1 (lightest, ~1:20). */
export function brewRatioToNormalized(ratioValue: number | null): number {
  if (ratioValue === null) return 0.5;
  return round3(clamp01((ratioValue - 6) / (20 - 6)));
}

/** Normalizes an extraction percentage to 0-1 against a ~0-30% practical range; unmeasured defaults to a typical ~20%. */
export function extractionToNormalized(extractionPercentage: number | null): number {
  if (extractionPercentage === null) return round3(20 / 30);
  return round3(clamp01(extractionPercentage / 30));
}

/** Normalizes a difficulty signal (Recipe Intelligence score, or the plain Beginner/Intermediate/Advanced label) to 0-1. */
export function difficultyToNormalized(difficultyScore: number | null, difficultyLabel: string | null): number {
  if (difficultyScore !== null) return round3(clamp01(difficultyScore / 10));
  const label = (difficultyLabel ?? "").toLowerCase();
  if (label === "beginner") return 0.2;
  if (label === "advanced") return 0.8;
  if (label === "intermediate") return 0.5;
  return 0.5;
}

/**
 * Builds a recipe's normalized 15-dimension sensory feature vector. Actual
 * user-entered sensory values (acidity/sweetness/body/bitterness) are
 * preferred; missing ones fall back to the Recipe Intelligence Engine's
 * predictions, then to the neutral midpoint. Flavor-family dimensions
 * (floral/fruity/chocolate/nutty) prefer the recipe's own flavor tags,
 * falling back to an origin-based heuristic.
 */
export function buildRecipeSensoryVector(input: RecipeFeatureVectorInput): SensoryVector {
  const tagSet = new Set(input.tagNames.map((tag) => tag.toLowerCase()));
  const originBias = input.originCountry ? ORIGIN_FLAVOR_BIAS[input.originCountry.toLowerCase()] ?? {} : {};

  function flavorDimension(dimension: "floral" | "fruity" | "chocolate" | "nutty"): number {
    const tagName = Object.entries(TAG_DIMENSIONS).find(([, value]) => value === dimension)?.[0];
    if (tagName && tagSet.has(tagName)) return 0.85;
    return originBias[dimension] ?? 0.3;
  }

  const vector: SensoryVector = {
    acidity: round3(fromTenScale(input.acidity ?? input.expectedAcidity)),
    sweetness: round3(fromTenScale(input.sweetness ?? input.expectedSweetness)),
    body: round3(fromTenScale(input.body ?? input.expectedBody)),
    bitterness: round3(fromTenScale(input.bitterness)),
    floral: round3(flavorDimension("floral")),
    fruity: round3(flavorDimension("fruity")),
    chocolate: round3(flavorDimension("chocolate")),
    nutty: round3(flavorDimension("nutty")),
    spice: round3(estimateSpice(input.tastingNotes, input.roastLevel)),
    fermented: round3(processToFermented(input.process)),
    clarity: round3(fromTenScale(input.expectedClarity)),
    roast: round3(roastToNormalized(input.roastLevel)),
    brewRatio: brewRatioToNormalized(input.brewRatioValue),
    extraction: extractionToNormalized(input.extractionPercentage),
    difficulty: difficultyToNormalized(input.difficultyScore, input.difficultyLabel),
  };

  return vector;
}

/** Converts a `SensoryVector` to the flat, ordered number array stored in `vector` jsonb columns (ready for future embeddings). */
export function sensoryVectorToArray(vector: SensoryVector): number[] {
  return SENSORY_VECTOR_DIMENSIONS.map((dimension) => vector[dimension]);
}

/** Converts a flat ordered number array (as read back from a `vector` jsonb column) into a `SensoryVector`. */
export function arrayToSensoryVector(values: number[]): SensoryVector {
  return SENSORY_VECTOR_DIMENSIONS.reduce((acc, dimension, index) => {
    acc[dimension] = values[index] ?? 0.5;
    return acc;
  }, {} as SensoryVector);
}

/**
 * Blends a set of weighted sample vectors (e.g. one per recipe a user
 * brewed/rated/favorited, weighted by rating/recency) into a single
 * preference vector. Falls back to `NEUTRAL_SENSORY_VECTOR` when there
 * are no samples yet -- an AI profile with no behavioral evidence starts
 * at the exact midpoint of every dimension.
 */
export function blendWeightedVectors(samples: { vector: SensoryVector; weight: number }[]): SensoryVector {
  const totalWeight = samples.reduce((sum, sample) => sum + sample.weight, 0);
  if (totalWeight <= 0) return { ...NEUTRAL_SENSORY_VECTOR };

  return SENSORY_VECTOR_DIMENSIONS.reduce((acc, dimension) => {
    const weightedSum = samples.reduce((sum, sample) => sum + sample.vector[dimension] * sample.weight, 0);
    acc[dimension] = round3(clamp01(weightedSum / totalWeight));
    return acc;
  }, {} as SensoryVector);
}

/**
 * Blends an explicit taste profile vector (from `user_taste_profiles`,
 * already 0-1 normalized -- see `lib/data/personal.ts`) with an implicit
 * behavioral vector, weighted by how much behavioral evidence exists.
 * With zero signals the result is exactly the explicit profile (or
 * neutral if that's unset too); as `signalCount` grows, behavior
 * increasingly outweighs the user's stated preferences -- the profile
 * "becomes smarter over time" by trusting what they actually brew over
 * what they once said they liked.
 */
export function blendExplicitAndBehavioral(
  explicit: SensoryVector | null,
  behavioral: SensoryVector | null,
  signalCount: number,
): SensoryVector {
  const base = explicit ?? { ...NEUTRAL_SENSORY_VECTOR };
  if (!behavioral || signalCount === 0) return base;

  // Behavioral weight ramps up to a 70% cap so a long, well-established
  // taste profile is never fully discarded, but a handful of early brews
  // isn't enough to override it either.
  const behavioralWeight = Math.min(0.7, signalCount / (signalCount + 5));

  return SENSORY_VECTOR_DIMENSIONS.reduce((acc, dimension) => {
    acc[dimension] = round3(clamp01(base[dimension] * (1 - behavioralWeight) + behavioral[dimension] * behavioralWeight));
    return acc;
  }, {} as SensoryVector);
}
