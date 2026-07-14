/**
 * Types for the BrewAtlas Recipe Intelligence Engine: automatic, rule-based
 * analysis of a recipe's brewing parameters. Everything here is deliberately
 * decoupled from the existing Recipe Engine (`types/recipe.ts`) and xBloom
 * Engine (`types/xbloom.ts`) types -- the analysis functions accept a plain
 * input shape and return a plain result shape, so they stay reusable and
 * easy to unit test regardless of where the data came from.
 */

export type BeverageStrength = "Light" | "Balanced" | "Strong";

export type ExtractionRisk = "Under-extraction risk" | "Balanced" | "Over-extraction risk";

export const WARNING_CODES = [
  "water_too_hot",
  "water_too_cold",
  "grind_too_fine",
  "grind_too_coarse",
  "ratio_too_strong",
  "ratio_too_weak",
  "bloom_too_short",
  "bloom_too_long",
  "excessive_agitation",
] as const;

export type WarningCode = (typeof WARNING_CODES)[number];

export type WarningSeverity = "info" | "warning" | "critical";

export type RecipeWarning = {
  code: WarningCode;
  severity: WarningSeverity;
  message: string;
};

/**
 * Plain, framework-agnostic input for `analyzeRecipe`. Every field is
 * optional/nullable because real recipes are frequently missing data --
 * the engine degrades gracefully and only calculates/warns on what it has.
 *
 * `agitation` and `xbloomPulsePattern`/`xbloomAgitation` let the engine
 * stay compatible with data sourced from the Smart Brewing Engine
 * (`brew_profiles`) and the xBloom Integration Foundation
 * (`xbloom_profiles`) respectively, without requiring either.
 */
export type RecipeAnalysisInput = {
  brewingMethodName: string | null;
  coffeeDose: number | null;
  waterAmount: number | null;
  waterTemperature: number | null;
  grindSize: string | null;
  bloomTime: string | null;
  bloomAmount: number | null;
  totalBrewTime: string | null;
  agitation: string | null;
  roastLevel: string | null;
  process: string | null;
  pourCount: number | null;
  /** Optional cross-engine signal from a linked `brew_profiles` row. */
  brewProfileAgitation?: string | null;
  /** Optional cross-engine signals from a linked `xbloom_profiles` row. */
  xbloomPulsePattern?: string | null;
  xbloomAgitation?: string | null;
};

export type ExpectedSensoryProfile = {
  sweetness: number;
  acidity: number;
  body: number;
  clarity: number;
  finish: number;
};

/** The full, deterministic output of `analyzeRecipe` for one set of inputs. */
export type RecipeAnalysisResult = {
  brewRatio: string | null;
  brewRatioValue: number | null;
  beverageStrength: BeverageStrength | null;
  extractionRisk: ExtractionRisk | null;
  difficultyScore: number | null;
  expected: ExpectedSensoryProfile;
  warnings: RecipeWarning[];
  /** Bumped whenever the scoring model changes, so stored rows can be identified as stale and recalculated. */
  engineVersion: string;
};

/** `public.recipe_insights` row, camelCased, with its warnings attached. */
export type RecipeInsightsRow = RecipeAnalysisResult & {
  id: string;
  recipeId: string;
  calculatedAt: string;
  updatedAt: string;
};

/** Raw shape of a `recipe_insights` row as selected from Supabase, including its warnings join. */
export type DbRecipeInsightsRow = {
  id: string;
  recipe_id: string;
  engine_version: string;
  brew_ratio: string | null;
  brew_ratio_value: number | null;
  beverage_strength: BeverageStrength | null;
  extraction_risk: ExtractionRisk | null;
  difficulty_score: number | null;
  expected_sweetness: number | null;
  expected_acidity: number | null;
  expected_body: number | null;
  expected_clarity: number | null;
  expected_finish: number | null;
  calculated_at: string;
  updated_at: string;
  recipe_insight_warnings:
    | {
        id: string;
        code: WarningCode;
        severity: WarningSeverity;
        message: string;
      }[]
    | null
    | undefined;
};
