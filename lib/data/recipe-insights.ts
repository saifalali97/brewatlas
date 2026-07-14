import type { SupabaseClient } from "@supabase/supabase-js";
import { toSafeArray } from "@/lib/utils/arrays";
import type { RecipeAnalysisInput, RecipeAnalysisResult, RecipeInsightsRow, DbRecipeInsightsRow } from "@/types/intelligence";

/**
 * Data-access layer for the Recipe Intelligence Engine's storage
 * (`recipe_insights`, `recipe_insight_warnings`). Mirrors the shape of
 * `lib/data/brew-engine.ts` / `lib/data/xbloom.ts`: repository functions
 * here only read/write rows -- the actual scoring happens in
 * `lib/intelligence/recipe-analysis.ts`, kept completely separate so the
 * analysis logic stays pure and reusable outside of Supabase.
 */

const RECIPE_INSIGHTS_SELECT = `
  id, recipe_id, engine_version, brew_ratio, brew_ratio_value, beverage_strength,
  extraction_risk, difficulty_score, expected_sweetness, expected_acidity, expected_body,
  expected_clarity, expected_finish, calculated_at, updated_at,
  recipe_insight_warnings ( id, code, severity, message )
`;

function mapDbRecipeInsightsToRow(row: DbRecipeInsightsRow): RecipeInsightsRow {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    engineVersion: row.engine_version,
    brewRatio: row.brew_ratio,
    brewRatioValue: row.brew_ratio_value,
    beverageStrength: row.beverage_strength,
    extractionRisk: row.extraction_risk,
    difficultyScore: row.difficulty_score,
    expected: {
      sweetness: row.expected_sweetness ?? 0,
      acidity: row.expected_acidity ?? 0,
      body: row.expected_body ?? 0,
      clarity: row.expected_clarity ?? 0,
      finish: row.expected_finish ?? 0,
    },
    warnings: toSafeArray(row.recipe_insight_warnings).map((warning) => ({
      code: warning.code,
      severity: warning.severity,
      message: warning.message,
    })),
    calculatedAt: row.calculated_at,
    updatedAt: row.updated_at,
  };
}

/** The stored calculated insights (if any) for a recipe, with its warnings attached. */
export async function getRecipeInsights(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<RecipeInsightsRow | null> {
  const { data, error } = await supabase
    .from("recipe_insights")
    .select(RECIPE_INSIGHTS_SELECT)
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbRecipeInsightsToRow(data as unknown as DbRecipeInsightsRow);
}

type RecipeAnalysisSourceRow = {
  coffee_dose: number | null;
  water_amount: number | null;
  water_temperature: number | null;
  grind_size: string | null;
  bloom_time: string | null;
  bloom_amount: number | null;
  total_brew_time: string | null;
  brewing_methods: { name: string } | null;
  coffees: { roast_level: string | null; process: string | null } | null;
  recipe_pours: { id: string }[] | null | undefined;
  brew_profiles: { agitation: string | null } | null;
  xbloom_profiles: { agitation: string | null; pulse_pattern: string | null }[] | { agitation: string | null; pulse_pattern: string | null } | null | undefined;
};

/**
 * Loads everything needed to build a `RecipeAnalysisInput` for a recipe
 * straight from the database, pulling in optional cross-engine signals
 * from a linked `brew_profiles` row (Smart Brewing Engine) and/or
 * `xbloom_profiles` row (xBloom Integration Foundation) when present.
 */
export async function buildRecipeAnalysisInputForRecipe(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<RecipeAnalysisInput | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `coffee_dose, water_amount, water_temperature, grind_size, bloom_time, bloom_amount, total_brew_time,
       brewing_methods ( name ), coffees ( roast_level, process ), recipe_pours ( id ),
       brew_profiles ( agitation ), xbloom_profiles ( agitation, pulse_pattern )`,
    )
    .eq("id", recipeId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as RecipeAnalysisSourceRow;
  const xbloom = toSafeArray(row.xbloom_profiles)[0] ?? null;

  return {
    brewingMethodName: row.brewing_methods?.name ?? null,
    coffeeDose: row.coffee_dose,
    waterAmount: row.water_amount,
    waterTemperature: row.water_temperature,
    grindSize: row.grind_size,
    bloomTime: row.bloom_time,
    bloomAmount: row.bloom_amount,
    totalBrewTime: row.total_brew_time,
    agitation: null,
    roastLevel: row.coffees?.roast_level ?? null,
    process: row.coffees?.process ?? null,
    pourCount: toSafeArray(row.recipe_pours).length,
    brewProfileAgitation: row.brew_profiles?.agitation ?? null,
    xbloomPulsePattern: xbloom?.pulse_pattern ?? null,
    xbloomAgitation: xbloom?.agitation ?? null,
  };
}

/**
 * Persists a `RecipeAnalysisResult` for a recipe: upserts the single
 * `recipe_insights` row (keyed by `recipe_id`) and replaces its warnings.
 * Callers are responsible for authorization (see
 * `lib/supabase/recipe-intelligence-actions.ts`).
 */
export async function upsertRecipeInsights(
  supabase: SupabaseClient,
  recipeId: string,
  result: RecipeAnalysisResult,
): Promise<{ id: string } | { error: string }> {
  const { data: upserted, error } = await supabase
    .from("recipe_insights")
    .upsert(
      {
        recipe_id: recipeId,
        engine_version: result.engineVersion,
        brew_ratio: result.brewRatio,
        brew_ratio_value: result.brewRatioValue,
        beverage_strength: result.beverageStrength,
        extraction_risk: result.extractionRisk,
        difficulty_score: result.difficultyScore,
        expected_sweetness: result.expected.sweetness,
        expected_acidity: result.expected.acidity,
        expected_body: result.expected.body,
        expected_clarity: result.expected.clarity,
        expected_finish: result.expected.finish,
        calculated_at: new Date().toISOString(),
      },
      { onConflict: "recipe_id" },
    )
    .select("id")
    .single();

  if (error || !upserted) {
    return { error: error?.message ?? "Failed to save recipe insights." };
  }

  const insightId = upserted.id as string;

  await supabase.from("recipe_insight_warnings").delete().eq("recipe_insight_id", insightId);
  if (result.warnings.length > 0) {
    await supabase.from("recipe_insight_warnings").insert(
      result.warnings.map((warning) => ({
        recipe_insight_id: insightId,
        code: warning.code,
        severity: warning.severity,
        message: warning.message,
      })),
    );
  }

  return { id: insightId };
}

/** Deletes the stored insights (and its warnings, via cascade) for a recipe. */
export async function deleteRecipeInsights(supabase: SupabaseClient, recipeId: string): Promise<void> {
  await supabase.from("recipe_insights").delete().eq("recipe_id", recipeId);
}
