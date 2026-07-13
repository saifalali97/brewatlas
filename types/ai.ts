import type { LookupOption } from "@/types/recipe";

/**
 * Types for BrewAtlas AI: the Recommendation Engine, Taste Similarity
 * Engine, Smart Recipe Discovery, the evolving AI User Profile, and the
 * LLM adapter interfaces that will later connect a real model without
 * changing any of the surrounding architecture.
 *
 * Nothing here calls an external API. Everything is deterministic,
 * rule-based, and reusable outside of Supabase/Next.js -- see
 * `lib/ai/*.ts` for the pure engine functions and `lib/data/ai.ts` for
 * the Supabase-backed orchestration on top of them.
 */

/**
 * The fixed dimension order for every normalized (0-1) sensory vector in
 * the system. Both `recipe_feature_vectors` and `ai_user_profiles` store
 * these same 15 dimensions, in this exact order, so a user's preference
 * vector and a recipe's feature vector are always directly comparable
 * (cosine similarity, dot product, or handed to a future embeddings
 * model as-is).
 */
export const SENSORY_VECTOR_DIMENSIONS = [
  "acidity",
  "sweetness",
  "body",
  "bitterness",
  "floral",
  "fruity",
  "chocolate",
  "nutty",
  "spice",
  "fermented",
  "clarity",
  "roast",
  "brewRatio",
  "extraction",
  "difficulty",
] as const;

export type SensoryDimension = (typeof SENSORY_VECTOR_DIMENSIONS)[number];

/** A normalized (0-1) value for every dimension in `SENSORY_VECTOR_DIMENSIONS`. */
export type SensoryVector = Record<SensoryDimension, number>;

/** All-midpoint vector, used as the default for a recipe/user the engine has no signal for yet. */
export const NEUTRAL_SENSORY_VECTOR: SensoryVector = SENSORY_VECTOR_DIMENSIONS.reduce(
  (acc, dimension) => ({ ...acc, [dimension]: 0.5 }),
  {} as SensoryVector,
);

/** `public.recipe_feature_vectors` row, camelCased -- one recipe's calculated AI feature vector. */
export type RecipeFeatureVector = {
  recipeId: string;
  engineVersion: string;
  vector: SensoryVector;
  originId: string | null;
  process: string | null;
  roastLevel: string | null;
  brewingMethodId: string | null;
  grinderId: string | null;
  deviceId: string | null;
  hasXbloomProfile: boolean;
  difficultyLabel: string | null;
  calculatedAt: string;
  updatedAt: string;
};

/** Raw shape of a `recipe_feature_vectors` row as selected from Supabase. */
export type DbRecipeFeatureVectorRow = {
  recipe_id: string;
  engine_version: string;
  acidity: number;
  sweetness: number;
  body: number;
  bitterness: number;
  floral: number;
  fruity: number;
  chocolate: number;
  nutty: number;
  spice: number;
  fermented: number;
  clarity: number;
  roast: number;
  brew_ratio: number;
  extraction: number;
  difficulty: number;
  origin_id: string | null;
  process: string | null;
  roast_level: string | null;
  brewing_method_id: string | null;
  grinder_id: string | null;
  device_id: string | null;
  has_xbloom_profile: boolean;
  difficulty_label: string | null;
  calculated_at: string;
  updated_at: string;
};

/** Minimal recipe metadata attached to any AI result for display, sourced from `recipes`. */
export type RecipeDisplayMeta = {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
};

/** `public.ai_user_profiles` row, camelCased -- the evolving AI User Profile. */
export type AiUserProfile = {
  userId: string;
  engineVersion: string;
  vector: SensoryVector;
  preferredOriginIds: string[];
  preferredProcesses: string[];
  preferredRoast: string | null;
  preferredBrewingMethodIds: string[];
  preferredGrinderId: string | null;
  preferredDeviceId: string | null;
  ownsXbloom: boolean;
  preferredDifficulty: string | null;
  avgRatingGiven: number | null;
  signalCount: number;
  computedAt: string | null;
};

/** Raw shape of an `ai_user_profiles` row as selected from Supabase. */
export type DbAiUserProfileRow = {
  user_id: string;
  engine_version: string;
  acidity: number;
  sweetness: number;
  body: number;
  bitterness: number;
  floral: number;
  fruity: number;
  chocolate: number;
  nutty: number;
  spice: number;
  fermented: number;
  clarity: number;
  roast: number;
  brew_ratio: number;
  extraction: number;
  difficulty: number;
  preferred_origin_ids: string[];
  preferred_processes: string[];
  preferred_roast: string | null;
  preferred_brewing_method_ids: string[];
  preferred_grinder_id: string | null;
  preferred_device_id: string | null;
  owns_xbloom: boolean;
  preferred_difficulty: string | null;
  avg_rating_given: number | null;
  signal_count: number;
  computed_at: string | null;
};

/** Per-signal contribution to a recommendation score (each 0-1, before weighting), for transparency/debugging. */
export type RecommendationBreakdown = {
  sensorySimilarity: number;
  originMatch: number;
  roastMatch: number;
  processMatch: number;
  brewingMethodMatch: number;
  grinderMatch: number;
  brewerMatch: number;
  xbloomMatch: number;
  difficultyMatch: number;
  ratingHistoryBoost: number;
};

/** One scored candidate from the Recommendation Engine, before recipe metadata is attached. */
export type RecipeRecommendationScore = {
  recipeId: string;
  score: number;
  breakdown: RecommendationBreakdown;
  reasons: string[];
};

/** A ranked recommendation ready for display. */
export type RecipeRecommendation = RecipeDisplayMeta & {
  score: number;
  breakdown: RecommendationBreakdown;
  reasons: string[];
};

/** One scored candidate from the Taste Similarity Engine, before recipe metadata is attached. */
export type SimilarRecipeScore = {
  recipeId: string;
  similarity: number;
  sharedAttributes: string[];
};

/** A ranked similar recipe ready for display. */
export type SimilarRecipeResult = RecipeDisplayMeta & {
  similarity: number;
  sharedAttributes: string[];
};

/** Low/high threshold intent for a sensory dimension, parsed from a discovery query (e.g. "low acidity"). */
export type SensoryIntent = "low" | "high";

/** Structured filters parsed from a Smart Recipe Discovery query. Every field is optional -- an empty query matches everything. */
export type DiscoveryFilters = {
  originCountries: string[];
  processes: string[];
  roastLevels: ("Light" | "Medium" | "Dark")[];
  brewingMethodNames: string[];
  deviceNames: string[];
  grinderNames: string[];
  xbloomDeviceName: string | null;
  sensory: Partial<Record<SensoryDimension, SensoryIntent>>;
};

/** Known vocabulary (from lookup tables) the Discovery Engine's query parser matches against. */
export type DiscoveryVocabulary = {
  originCountries: string[];
  processes: string[];
  brewingMethods: LookupOption[];
  devices: LookupOption[];
  grinders: LookupOption[];
  xbloomDeviceNames: string[];
};

/** One scored match from Smart Recipe Discovery. */
export type DiscoveryResult = RecipeDisplayMeta & {
  matchScore: number;
  matchedOn: string[];
};

// ---------------------------------------------------------------------------
// Future LLM Support (adapter pattern). No external API is called by any
// implementation below -- see lib/ai/llm-adapter.ts.
// ---------------------------------------------------------------------------

export const LLM_PROVIDERS = ["openai", "anthropic", "gemini", "none"] as const;
export type LLMProvider = (typeof LLM_PROVIDERS)[number];

export type LLMCompletionRequest = {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
};

export type LLMCompletionResponse = {
  text: string;
  provider: LLMProvider;
  model: string;
};

export type LLMEmbeddingRequest = {
  input: string | string[];
};

export type LLMEmbeddingResponse = {
  embeddings: number[][];
  provider: LLMProvider;
  model: string;
};

/**
 * The adapter every LLM provider implements. `lib/ai/discovery-engine.ts`
 * and `lib/data/ai.ts` are written against this interface, not against
 * any specific provider, so swapping `getLLMAdapter()`'s configured
 * provider later is a one-line env var change -- no calling code changes.
 */
export interface LLMAdapter {
  readonly provider: LLMProvider;
  complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
  embed(request: LLMEmbeddingRequest): Promise<LLMEmbeddingResponse>;
}
