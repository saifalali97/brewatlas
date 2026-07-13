import type { SupabaseClient } from "@supabase/supabase-js";
import { analyzeRecipeForCoaching } from "@/lib/ai/coach-engine";
import type {
  AiCoachAnalysisRow,
  CoachAnalysisInput,
  CoachAnalysisResult,
  DbAiCoachAnalysisRow,
} from "@/types/coach";

/**
 * Data-access layer for the AI Coach (requirement 10/11: database +
 * history). Mirrors the shape of `lib/data/recipe-insights.ts`:
 * repository functions here only build input, read, and write rows --
 * the actual scoring/coaching-copy logic lives in
 * `lib/ai/coach-engine.ts` / `lib/ai/coach-messages.ts`, kept completely
 * separate so the engine stays pure and reusable outside of Supabase.
 */

type CoachAnalysisSourceRow = {
  brewing_methods: { name: string } | null;
  coffee_dose: number | null;
  water_amount: number | null;
  water_temperature: number | null;
  grind_size: string | null;
  bloom_time: string | null;
  bloom_amount: number | null;
  total_brew_time: string | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  bitterness: number | null;
  coffees: {
    name: string;
    roast_level: string | null;
    process: string | null;
    origins: { country: string } | null;
  } | null;
  recipe_pours: { id: string }[];
  brew_profiles: { agitation: string | null } | null;
  xbloom_profiles: { agitation: string | null; pulse_pattern: string | null }[];
};

/**
 * Loads everything needed to build a `CoachAnalysisInput` for a recipe
 * straight from the database, including the recipe's own author-entered
 * sensory ratings and the optional cross-engine agitation signals
 * (Smart Brewing Engine / xBloom Integration Foundation) the underlying
 * Recipe Intelligence Engine also understands.
 */
export async function buildCoachAnalysisInputForRecipe(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<CoachAnalysisInput | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `coffee_dose, water_amount, water_temperature, grind_size, bloom_time, bloom_amount, total_brew_time,
       sweetness, acidity, body, bitterness,
       brewing_methods ( name ),
       coffees ( name, roast_level, process, origins ( country ) ),
       recipe_pours ( id ),
       brew_profiles ( agitation ), xbloom_profiles ( agitation, pulse_pattern )`,
    )
    .eq("id", recipeId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as CoachAnalysisSourceRow;
  const xbloom = row.xbloom_profiles[0] ?? null;

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
    pourCount: row.recipe_pours.length,
    brewProfileAgitation: row.brew_profiles?.agitation ?? null,
    xbloomPulsePattern: xbloom?.pulse_pattern ?? null,
    xbloomAgitation: xbloom?.agitation ?? null,
    actualSweetness: row.sweetness,
    actualAcidity: row.acidity,
    actualBody: row.body,
    actualBitterness: row.bitterness,
    originCountry: row.coffees?.origins?.country ?? null,
    coffeeName: row.coffees?.name ?? null,
  };
}

function mapDbAiCoachAnalysisToRow(row: DbAiCoachAnalysisRow): AiCoachAnalysisRow {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    userId: row.user_id,
    engineVersion: row.engine_version,
    brewScore: row.brew_score,
    confidence: {
      level: row.confidence_level,
      score: row.confidence_score,
      metricsScored: row.metrics_scored,
      metricsTotal: row.metrics_total,
    },
    metrics: row.metrics,
    messages: row.messages,
    strengths: row.strengths,
    weaknesses: row.weaknesses,
    suggestions: row.suggestions,
    extractionRisk: row.extraction_risk,
    beverageStrength: row.beverage_strength,
    createdAt: row.created_at,
  };
}

const AI_COACH_ANALYSIS_SELECT = `
  id, recipe_id, user_id, engine_version, brew_score, confidence_level, confidence_score,
  metrics_scored, metrics_total, extraction_risk, beverage_strength,
  metrics, messages, strengths, weaknesses, suggestions, created_at
`;

/**
 * Persists one AI Coach analysis run as a new, immutable history row --
 * never upserted, so every past run for a recipe stays queryable (see
 * `getCoachAnalysisHistory`).
 */
export async function saveCoachAnalysis(
  supabase: SupabaseClient,
  recipeId: string,
  userId: string,
  result: CoachAnalysisResult,
): Promise<AiCoachAnalysisRow | { error: string }> {
  const { data, error } = await supabase
    .from("ai_coach_analyses")
    .insert({
      recipe_id: recipeId,
      user_id: userId,
      engine_version: result.engineVersion,
      brew_score: result.brewScore,
      confidence_level: result.confidence.level,
      confidence_score: result.confidence.score,
      metrics_scored: result.confidence.metricsScored,
      metrics_total: result.confidence.metricsTotal,
      extraction_risk: result.extractionRisk,
      beverage_strength: result.beverageStrength,
      metrics: result.metrics,
      messages: result.messages,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
    })
    .select(AI_COACH_ANALYSIS_SELECT)
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to save AI Coach analysis." };
  }

  return mapDbAiCoachAnalysisToRow(data as unknown as DbAiCoachAnalysisRow);
}

/**
 * Runs the AI Coach engine on a recipe for the given user and stores the
 * result as a new history row. This is the single entry point
 * `lib/supabase/ai-coach-actions.ts` calls -- it never exposes the raw
 * engine or the database layer directly to Server Actions.
 */
export async function analyzeRecipe(
  supabase: SupabaseClient,
  recipeId: string,
  userId: string,
): Promise<{ result: CoachAnalysisResult; saved: AiCoachAnalysisRow | null } | { error: string }> {
  const input = await buildCoachAnalysisInputForRecipe(supabase, recipeId);
  if (!input) {
    return { error: "Recipe not found or missing brewing parameters." };
  }

  const result = analyzeRecipeForCoaching(input);
  const saved = await saveCoachAnalysis(supabase, recipeId, userId, result);

  if ("error" in saved) {
    // The analysis itself is still valid and returned to the caller --
    // only the history write failed (e.g. transient DB issue).
    console.error("Failed to save AI Coach analysis:", saved.error);
    return { result, saved: null };
  }

  return { result, saved };
}

/** A user's past AI Coach analyses for one recipe, most recent first -- requirement 11: "store previous analyses". */
export async function getCoachAnalysisHistory(
  supabase: SupabaseClient,
  recipeId: string,
  userId: string,
  limit = 20,
): Promise<AiCoachAnalysisRow[]> {
  const { data, error } = await supabase
    .from("ai_coach_analyses")
    .select(AI_COACH_ANALYSIS_SELECT)
    .eq("recipe_id", recipeId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as DbAiCoachAnalysisRow[]).map(mapDbAiCoachAnalysisToRow);
}

/** The most recent AI Coach analysis a user ran for a recipe, or `null` if they haven't run one yet. */
export async function getLatestCoachAnalysis(
  supabase: SupabaseClient,
  recipeId: string,
  userId: string,
): Promise<AiCoachAnalysisRow | null> {
  const history = await getCoachAnalysisHistory(supabase, recipeId, userId, 1);
  return history[0] ?? null;
}
