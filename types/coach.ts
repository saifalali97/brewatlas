import type { LLMProvider } from "@/types/ai";
import type { BeverageStrength, ExtractionRisk, RecipeAnalysisInput } from "@/types/intelligence";

/**
 * Types for the BrewAtlas AI Coach: a deterministic, rule-based module
 * that evaluates a recipe across 15 brewing/sensory metrics and returns
 * a Brew Score, confidence level, coaching messages, strengths,
 * weaknesses, and improvement suggestions.
 *
 * The Coach is built entirely on top of the existing Recipe Intelligence
 * Engine (`lib/intelligence/recipe-analysis.ts` / `types/intelligence.ts`)
 * -- it does not recompute brew ratio, extraction risk, or the expected
 * sensory profile from scratch, it interprets those calculated values
 * into per-metric scores and plain-language coaching. See
 * `lib/ai/coach-engine.ts` for the pure scoring functions and
 * `lib/ai/coach-messages.ts` for the message templates.
 *
 * Nothing here calls an external API -- see `lib/ai/coach-adapter.ts`
 * for the "Future LLM Support" adapter interface (requirement 12/13),
 * which mirrors `lib/ai/llm-adapter.ts` exactly so a real OpenAI/
 * Anthropic/Gemini model can later generate a more conversational
 * narrative from the same deterministic analysis, without changing any
 * calling code.
 */

/** The 15 dimensions the AI Coach evaluates on every recipe, in a fixed, documented order. */
export const COACH_METRIC_KEYS = [
  "brewRatio",
  "extraction",
  "grindSize",
  "bloom",
  "waterTemperature",
  "pouringStructure",
  "brewTime",
  "agitation",
  "strength",
  "clarity",
  "sweetness",
  "acidity",
  "bitterness",
  "body",
  "balance",
] as const;

export type CoachMetricKey = (typeof COACH_METRIC_KEYS)[number];

/**
 * Metrics fall into two evaluation styles:
 * - "process" metrics have a well-known ideal range (e.g. water
 *   temperature, grind size, bloom time) -- deviating from it is a
 *   flaw, scored down accordingly.
 * - "descriptive" metrics (sweetness/acidity/body/clarity) don't have a
 *   universal ideal -- they describe the cup's predicted character, so
 *   the score reflects predicted intensity, not correctness.
 */
export type CoachMetricStyle = "process" | "descriptive";

export const COACH_METRIC_STYLES: Record<CoachMetricKey, CoachMetricStyle> = {
  brewRatio: "process",
  extraction: "process",
  grindSize: "process",
  bloom: "process",
  waterTemperature: "process",
  pouringStructure: "process",
  brewTime: "process",
  agitation: "process",
  strength: "process",
  bitterness: "process",
  balance: "process",
  clarity: "descriptive",
  sweetness: "descriptive",
  acidity: "descriptive",
  body: "descriptive",
};

export type CoachMetricStatus = "excellent" | "good" | "needs_attention" | "poor" | "unknown";

/**
 * One evaluated metric. `rawValue`/`idealRange`/`unit` carry the numeric
 * context (e.g. `rawValue: 94`, `idealRange: [90, 96]`, `unit: "°C"`) so
 * `lib/ai/coach-messages.ts` can generate specific, actionable copy
 * ("Reduce water temperature by 2°C") instead of only generic text.
 */
export type CoachMetricEvaluation = {
  key: CoachMetricKey;
  label: string;
  style: CoachMetricStyle;
  /** 0-100, or `null` when there wasn't enough recipe data to evaluate this metric. */
  score: number | null;
  status: CoachMetricStatus;
  /** Human-readable actual value, e.g. "1:16.2", "94°C", "Medium-Fine". */
  value: string | null;
  /** Human-readable ideal/expected value or range, e.g. "1:15-1:17", "90-96°C". */
  target: string | null;
  rawValue: number | null;
  idealRange: [number, number] | null;
  unit: string | null;
};

export type CoachMessageSeverity = "positive" | "info" | "warning" | "critical";

export type CoachMessage = {
  metric: CoachMetricKey;
  severity: CoachMessageSeverity;
  message: string;
};

export type CoachConfidenceLevel = "low" | "medium" | "high";

/** How much of the analysis is backed by real recipe data vs. defaults -- mirrors `ai_user_profiles.signal_count`'s "the AI doesn't know this yet" concept. */
export type CoachConfidence = {
  level: CoachConfidenceLevel;
  /** 0-1 fraction of the 15 metrics that had enough data to score. */
  score: number;
  metricsScored: number;
  metricsTotal: number;
};

/**
 * Plain, framework-agnostic input for `analyzeRecipeForCoaching`.
 * Deliberately a superset of `RecipeAnalysisInput` (same optional/
 * nullable philosophy) plus the recipe's own author-entered sensory
 * ratings and a couple of display fields used only for message copy
 * (e.g. "Your recipe is ideal for fruity coffees.").
 */
export type CoachAnalysisInput = RecipeAnalysisInput & {
  /** Author-entered sensory ratings (1-10), preferred over the Intelligence Engine's calculated `expected` profile when present. */
  actualSweetness?: number | null;
  actualAcidity?: number | null;
  actualBody?: number | null;
  actualBitterness?: number | null;
  originCountry?: string | null;
  coffeeName?: string | null;
};

/** The full, deterministic output of `analyzeRecipeForCoaching` for one recipe. */
export type CoachAnalysisResult = {
  engineVersion: string;
  brewScore: number;
  confidence: CoachConfidence;
  metrics: CoachMetricEvaluation[];
  messages: CoachMessage[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  /** Carried through for display/debugging -- the same values the Recipe Intelligence Engine would report for this recipe. */
  extractionRisk: ExtractionRisk | null;
  beverageStrength: BeverageStrength | null;
};

/** `public.ai_coach_analyses` row, camelCased -- one stored analysis (requirement 10/11: AI history). */
export type AiCoachAnalysisRow = CoachAnalysisResult & {
  id: string;
  recipeId: string;
  userId: string;
  createdAt: string;
};

/** Raw shape of an `ai_coach_analyses` row as selected from Supabase. */
export type DbAiCoachAnalysisRow = {
  id: string;
  recipe_id: string;
  user_id: string;
  engine_version: string;
  brew_score: number;
  confidence_level: CoachConfidenceLevel;
  confidence_score: number;
  metrics_scored: number;
  metrics_total: number;
  extraction_risk: ExtractionRisk | null;
  beverage_strength: BeverageStrength | null;
  metrics: CoachMetricEvaluation[];
  messages: CoachMessage[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  created_at: string;
};

// ---------------------------------------------------------------------------
// Future LLM Support (adapter pattern) -- requirements 12/13. Mirrors
// `lib/ai/llm-adapter.ts` exactly. No implementation below calls an
// external API; see `lib/ai/coach-adapter.ts`.
// ---------------------------------------------------------------------------

export type CoachNarrativeRequest = {
  analysis: CoachAnalysisResult;
  recipeTitle: string;
};

export type CoachNarrativeResponse = {
  narrative: string;
  provider: LLMProvider;
};

/**
 * The adapter every AI Coach "explanation" provider implements.
 * `lib/data/ai-coach.ts` is written against this interface, not any
 * specific provider -- swapping the configured provider later is an
 * environment/config change, not a code change. The default
 * (`RuleBasedCoachAdapter`, see `lib/ai/coach-adapter.ts`) never calls
 * out; it just joins the deterministic `messages` into prose.
 */
export interface CoachAdapter {
  readonly provider: LLMProvider;
  explainAnalysis(request: CoachNarrativeRequest): Promise<CoachNarrativeResponse>;
}
