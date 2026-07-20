import type { SupabaseClient } from "@supabase/supabase-js";
import { blendExplicitAndBehavioral, blendWeightedVectors, buildRecipeSensoryVector, ENGINE_VERSION, sensoryVectorToArray } from "@/lib/ai/feature-vectors";
import { parseDiscoveryQuery, rankDiscoveryResults, type DiscoveryCandidate } from "@/lib/ai/discovery-engine";
import { RECOMMENDATION_WEIGHTS, rankRecommendations, type RecipeCandidate, type RecommendationContext } from "@/lib/ai/recommendation-engine";
import { rankSimilarRecipes, type SimilarityCandidate } from "@/lib/ai/similarity-engine";
import { officialRecipeBoost } from "@/lib/data/official-recipes";
import { toSafeArray } from "@/lib/utils/arrays";
import type { RecipeKind, RecipeVerificationStatus } from "@/types/official-recipe";
import type {
  AiUserProfile,
  DbAiUserProfileRow,
  DbRecipeFeatureVectorRow,
  DiscoveryResult,
  DiscoveryVocabulary,
  RecipeDisplayMeta,
  RecipeFeatureVector,
  RecipeRecommendation,
  SensoryVector,
  SimilarRecipeResult,
} from "@/types/ai";
import { NEUTRAL_SENSORY_VECTOR } from "@/types/ai";

/**
 * Data-access + orchestration layer for BrewAtlas AI: builds and persists
 * recipe feature vectors and the evolving AI User Profile, and exposes
 * the four reusable entry points requested for the Recommendation API --
 * `getRecommendations`, `getSimilarRecipes`, `updateTasteProfile`,
 * `getDiscoveryResults`.
 *
 * The actual scoring/similarity/parsing logic lives in the pure
 * `lib/ai/*.ts` engines; everything here only reads/writes Supabase and
 * assembles their inputs, mirroring `lib/data/recipe-insights.ts`.
 */

const RECIPE_FEATURE_SELECT = `
  id, title, slug, cover_image_url, published, difficulty, sweetness, acidity, body, bitterness, tasting_notes,
  brewing_method_id, grinder_id, device_id, recipe_kind, verification_status,
  coffees ( process, roast_level, origin_id, origins ( country ) ),
  recipe_insights ( expected_acidity, expected_sweetness, expected_body, expected_clarity, brew_ratio_value, difficulty_score ),
  recipe_tags ( tags ( name ) ),
  xbloom_profiles ( id )
`;

type RecipeFeatureSourceRow = {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  published: boolean;
  difficulty: string | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  bitterness: number | null;
  tasting_notes: string | null;
  brewing_method_id: string | null;
  grinder_id: string | null;
  device_id: string | null;
  recipe_kind: string | null;
  verification_status: string | null;
  coffees: { process: string | null; roast_level: string | null; origin_id: string | null; origins: { country: string } | null } | null;
  // Both recipe_insights.recipe_id and xbloom_profiles.recipe_id are
  // `unique`, so PostgREST infers a to-one relationship here (a plain
  // nullable object, not an array) when embedding from `recipes`.
  recipe_insights: {
    expected_acidity: number | null;
    expected_sweetness: number | null;
    expected_body: number | null;
    expected_clarity: number | null;
    brew_ratio_value: number | null;
    difficulty_score: number | null;
  } | null;
  recipe_tags: { tags: { name: string } | null }[] | null | undefined;
  xbloom_profiles: { id: string } | null;
};

function mapDbFeatureVectorRow(row: DbRecipeFeatureVectorRow): RecipeFeatureVector {
  return {
    recipeId: row.recipe_id,
    engineVersion: row.engine_version,
    vector: {
      acidity: row.acidity,
      sweetness: row.sweetness,
      body: row.body,
      bitterness: row.bitterness,
      floral: row.floral,
      fruity: row.fruity,
      chocolate: row.chocolate,
      nutty: row.nutty,
      spice: row.spice,
      fermented: row.fermented,
      clarity: row.clarity,
      roast: row.roast,
      brewRatio: row.brew_ratio,
      extraction: row.extraction,
      difficulty: row.difficulty,
    },
    originId: row.origin_id,
    process: row.process,
    roastLevel: row.roast_level,
    brewingMethodId: row.brewing_method_id,
    grinderId: row.grinder_id,
    deviceId: row.device_id,
    hasXbloomProfile: row.has_xbloom_profile,
    difficultyLabel: row.difficulty_label,
    calculatedAt: row.calculated_at,
    updatedAt: row.updated_at,
  };
}

/** Computes (without persisting) a recipe's feature vector straight from its current data. */
async function buildRecipeFeatureVector(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<{ vector: RecipeFeatureVector; display: RecipeDisplayMeta } | null> {
  const { data, error } = await supabase.from("recipes").select(RECIPE_FEATURE_SELECT).eq("id", recipeId).maybeSingle();
  if (error || !data) return null;

  const row = data as unknown as RecipeFeatureSourceRow;
  const tagNames = toSafeArray(row.recipe_tags)
    .map((rt) => rt.tags?.name)
    .filter((name): name is string => Boolean(name));
  const insights = row.recipe_insights;

  const vector = buildRecipeSensoryVector({
    acidity: row.acidity,
    sweetness: row.sweetness,
    body: row.body,
    bitterness: row.bitterness,
    expectedAcidity: insights?.expected_acidity ?? null,
    expectedSweetness: insights?.expected_sweetness ?? null,
    expectedBody: insights?.expected_body ?? null,
    expectedClarity: insights?.expected_clarity ?? null,
    roastLevel: row.coffees?.roast_level ?? null,
    process: row.coffees?.process ?? null,
    originCountry: row.coffees?.origins?.country ?? null,
    tagNames,
    tastingNotes: row.tasting_notes,
    brewRatioValue: insights?.brew_ratio_value ?? null,
    extractionPercentage: null,
    difficultyScore: insights?.difficulty_score ?? null,
    difficultyLabel: row.difficulty,
  });

  return {
    vector: {
      recipeId,
      engineVersion: ENGINE_VERSION,
      vector,
      originId: row.coffees?.origin_id ?? null,
      process: row.coffees?.process ?? null,
      roastLevel: row.coffees?.roast_level ?? null,
      brewingMethodId: row.brewing_method_id,
      grinderId: row.grinder_id,
      deviceId: row.device_id,
      hasXbloomProfile: row.xbloom_profiles !== null,
      difficultyLabel: row.difficulty,
      calculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    display: { id: row.id, title: row.title, slug: row.slug, coverImageUrl: row.cover_image_url },
  };
}

/** Computes and persists a recipe's feature vector, returning it alongside its display metadata. */
export async function refreshRecipeFeatureVector(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<{ vector: RecipeFeatureVector; display: RecipeDisplayMeta } | null> {
  const built = await buildRecipeFeatureVector(supabase, recipeId);
  if (!built) return null;

  const v = built.vector;
  await supabase.from("recipe_feature_vectors").upsert(
    {
      recipe_id: recipeId,
      engine_version: v.engineVersion,
      acidity: v.vector.acidity,
      sweetness: v.vector.sweetness,
      body: v.vector.body,
      bitterness: v.vector.bitterness,
      floral: v.vector.floral,
      fruity: v.vector.fruity,
      chocolate: v.vector.chocolate,
      nutty: v.vector.nutty,
      spice: v.vector.spice,
      fermented: v.vector.fermented,
      clarity: v.vector.clarity,
      roast: v.vector.roast,
      brew_ratio: v.vector.brewRatio,
      extraction: v.vector.extraction,
      difficulty: v.vector.difficulty,
      vector: sensoryVectorToArray(v.vector),
      origin_id: v.originId,
      process: v.process,
      roast_level: v.roastLevel,
      brewing_method_id: v.brewingMethodId,
      grinder_id: v.grinderId,
      device_id: v.deviceId,
      has_xbloom_profile: v.hasXbloomProfile,
      difficulty_label: v.difficultyLabel,
      calculated_at: v.calculatedAt,
    },
    { onConflict: "recipe_id" },
  );

  return built;
}

const FEATURE_VECTOR_SELECT = `
  recipe_id, engine_version, acidity, sweetness, body, bitterness, floral, fruity, chocolate, nutty, spice, fermented,
  clarity, roast, brew_ratio, extraction, difficulty, origin_id, process, roast_level, brewing_method_id, grinder_id,
  device_id, has_xbloom_profile, difficulty_label, calculated_at, updated_at,
  recipes ( id, title, slug, cover_image_url, published )
`;

type FeatureVectorWithDisplayRow = DbRecipeFeatureVectorRow & {
  recipes: { id: string; title: string; slug: string; cover_image_url: string | null; published: boolean } | null;
};

/** The persisted feature vector for a recipe, lazily building + persisting it on first access. */
export async function getRecipeFeatureVector(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<{ vector: RecipeFeatureVector; display: RecipeDisplayMeta } | null> {
  const { data } = await supabase.from("recipe_feature_vectors").select(FEATURE_VECTOR_SELECT).eq("recipe_id", recipeId).maybeSingle();

  if (data) {
    const row = data as unknown as FeatureVectorWithDisplayRow;
    if (row.recipes) {
      return {
        vector: mapDbFeatureVectorRow(row),
        display: { id: row.recipes.id, title: row.recipes.title, slug: row.recipes.slug, coverImageUrl: row.recipes.cover_image_url },
      };
    }
  }

  return refreshRecipeFeatureVector(supabase, recipeId);
}

/** Every published recipe's feature vector + display metadata, lazily backfilling any recipe that doesn't have one yet. */
export async function getAllRecipeFeatureVectors(
  supabase: SupabaseClient,
  excludeRecipeIds: Set<string> = new Set(),
): Promise<{ vector: RecipeFeatureVector; display: RecipeDisplayMeta }[]> {
  const { data: publishedRecipes } = await supabase.from("recipes").select("id").eq("published", true);
  const publishedIds = (publishedRecipes ?? []).map((r) => r.id as string).filter((id) => !excludeRecipeIds.has(id));
  if (publishedIds.length === 0) return [];

  const { data: existingVectors } = await supabase
    .from("recipe_feature_vectors")
    .select(FEATURE_VECTOR_SELECT)
    .in("recipe_id", publishedIds);

  const existingRows = ((existingVectors ?? []) as unknown as FeatureVectorWithDisplayRow[]).filter((row) => row.recipes);
  const existingIds = new Set(existingRows.map((row) => row.recipe_id));
  const missingIds = publishedIds.filter((id) => !existingIds.has(id));

  const backfilled = await Promise.all(missingIds.map((id) => refreshRecipeFeatureVector(supabase, id)));

  const fromExisting = existingRows.map((row) => ({
    vector: mapDbFeatureVectorRow(row),
    display: {
      id: row.recipes!.id,
      title: row.recipes!.title,
      slug: row.recipes!.slug,
      coverImageUrl: row.recipes!.cover_image_url,
    },
  }));

  const fromBackfill = backfilled.filter((entry): entry is { vector: RecipeFeatureVector; display: RecipeDisplayMeta } => entry !== null);

  return [...fromExisting, ...fromBackfill];
}

// ---------------------------------------------------------------------------
// AI User Profile
// ---------------------------------------------------------------------------

function mapDbAiUserProfileRow(row: DbAiUserProfileRow): AiUserProfile {
  return {
    userId: row.user_id,
    engineVersion: row.engine_version,
    vector: {
      acidity: row.acidity,
      sweetness: row.sweetness,
      body: row.body,
      bitterness: row.bitterness,
      floral: row.floral,
      fruity: row.fruity,
      chocolate: row.chocolate,
      nutty: row.nutty,
      spice: row.spice,
      fermented: row.fermented,
      clarity: row.clarity,
      roast: row.roast,
      brewRatio: row.brew_ratio,
      extraction: row.extraction,
      difficulty: row.difficulty,
    },
    preferredOriginIds: row.preferred_origin_ids ?? [],
    preferredProcesses: row.preferred_processes ?? [],
    preferredRoast: row.preferred_roast,
    preferredBrewingMethodIds: row.preferred_brewing_method_ids ?? [],
    preferredGrinderId: row.preferred_grinder_id,
    preferredDeviceId: row.preferred_device_id,
    ownsXbloom: row.owns_xbloom,
    preferredDifficulty: row.preferred_difficulty,
    avgRatingGiven: row.avg_rating_given,
    signalCount: row.signal_count,
    computedAt: row.computed_at,
  };
}

const AI_PROFILE_SELECT = `
  user_id, engine_version, acidity, sweetness, body, bitterness, floral, fruity, chocolate, nutty, spice, fermented,
  clarity, roast, brew_ratio, extraction, difficulty, preferred_origin_ids, preferred_processes, preferred_roast,
  preferred_brewing_method_ids, preferred_grinder_id, preferred_device_id, owns_xbloom, preferred_difficulty,
  avg_rating_given, signal_count, computed_at
`;

/** The stored AI User Profile for a user, or `null` if it hasn't been computed yet (call `updateTasteProfile` first). */
export async function getAiUserProfile(supabase: SupabaseClient, userId: string): Promise<AiUserProfile | null> {
  const { data, error } = await supabase.from("ai_user_profiles").select(AI_PROFILE_SELECT).eq("user_id", userId).maybeSingle();
  if (error || !data) return null;
  return mapDbAiUserProfileRow(data as unknown as DbAiUserProfileRow);
}

type WeightedRecipeSample = { recipeId: string; weight: number };

function topWeighted<T extends string>(entries: [T, number][], limit: number): T[] {
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

/**
 * Recomputes and persists the AI User Profile for `userId`: blends their
 * explicit taste profile with an implicit vector derived from every
 * recipe they've brewed, rated, reviewed, saved, or liked, and distills
 * their categorical preferences (origins, processes, roast, brewing
 * methods, grinder, brewer, xBloom ownership, difficulty). This is what
 * makes the profile "become smarter over time" -- call it after any
 * brew log, favorite, rating, review, or completed recipe (see the hooks
 * in `lib/supabase/brew-log-actions.ts` / `favorite-actions.ts` /
 * `recipe-engagement-actions.ts`).
 */
export async function updateTasteProfile(supabase: SupabaseClient, userId: string): Promise<AiUserProfile> {
  const [profileRes, tasteProfileRes, coffeeSetupRes, brewLogsRes, reviewsRes, favoritesRes, likesRes] = await Promise.all([
    supabase.from("profiles").select("favorite_origin_id, favorite_grinder_id, favorite_device_id, owns_xbloom").eq("id", userId).maybeSingle(),
    supabase
      .from("user_taste_profiles")
      .select(
        "acidity_preference, sweetness_preference, body_preference, fruity, chocolate, floral, nutty, fermented, roast_preference, user_taste_profile_processes ( process )",
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("user_coffee_setups").select("grinder_id, brewer_device_id, xbloom_device_id").eq("user_id", userId).maybeSingle(),
    supabase.from("user_brew_logs").select("recipe_id, rating, brewing_method_id").eq("user_id", userId),
    supabase.from("recipe_reviews").select("recipe_id, rating").eq("user_id", userId),
    supabase.from("favorites").select("recipe_id").eq("user_id", userId),
    supabase.from("recipe_likes").select("recipe_id").eq("user_id", userId),
  ]);

  const brewLogs = brewLogsRes.data ?? [];
  const reviews = reviewsRes.data ?? [];
  const favorites = favoritesRes.data ?? [];
  const likes = likesRes.data ?? [];

  const samples: WeightedRecipeSample[] = [
    ...brewLogs.filter((log) => log.recipe_id).map((log) => ({ recipeId: log.recipe_id as string, weight: log.rating ?? 3 })),
    ...reviews.map((review) => ({ recipeId: review.recipe_id as string, weight: review.rating })),
    ...favorites.map((favorite) => ({ recipeId: favorite.recipe_id as string, weight: 4 })),
    ...likes.map((like) => ({ recipeId: like.recipe_id as string, weight: 3 })),
  ];

  const uniqueRecipeIds = [...new Set(samples.map((s) => s.recipeId))];
  const vectorsByRecipeId = new Map<string, RecipeFeatureVector>();
  await Promise.all(
    uniqueRecipeIds.map(async (recipeId) => {
      const result = await getRecipeFeatureVector(supabase, recipeId);
      if (result) vectorsByRecipeId.set(recipeId, result.vector);
    }),
  );

  const behavioralSamples = samples
    .filter((s) => vectorsByRecipeId.has(s.recipeId))
    .map((s) => ({ vector: vectorsByRecipeId.get(s.recipeId)!.vector, weight: s.weight }));

  const signalCount = samples.length;
  const behavioralVector = signalCount > 0 ? blendWeightedVectors(behavioralSamples) : null;

  const tasteProfile = tasteProfileRes.data as
    | {
        acidity_preference: number | null;
        sweetness_preference: number | null;
        body_preference: number | null;
        fruity: number | null;
        chocolate: number | null;
        floral: number | null;
        nutty: number | null;
        fermented: number | null;
        roast_preference: string | null;
        user_taste_profile_processes: { process: string }[] | null | undefined;
      }
    | null;

  const explicitVector: SensoryVector | null = tasteProfile
    ? {
        ...NEUTRAL_SENSORY_VECTOR,
        acidity: (tasteProfile.acidity_preference ?? 5) / 10,
        sweetness: (tasteProfile.sweetness_preference ?? 5) / 10,
        body: (tasteProfile.body_preference ?? 5) / 10,
        floral: (tasteProfile.floral ?? 5) / 10,
        fruity: (tasteProfile.fruity ?? 5) / 10,
        chocolate: (tasteProfile.chocolate ?? 5) / 10,
        nutty: (tasteProfile.nutty ?? 5) / 10,
        fermented: (tasteProfile.fermented ?? 5) / 10,
      }
    : null;

  const finalVector = blendExplicitAndBehavioral(explicitVector, behavioralVector, signalCount);

  // Categorical preferences: weighted tallies of origin/process/brewing
  // method across every sample recipe, so a coffee brewed 10 times counts
  // far more than one saved once.
  const originWeights = new Map<string, number>();
  const processWeights = new Map<string, number>();
  const difficultyWeights = new Map<string, number>();
  for (const sample of samples) {
    const vector = vectorsByRecipeId.get(sample.recipeId);
    if (!vector) continue;
    if (vector.originId) originWeights.set(vector.originId, (originWeights.get(vector.originId) ?? 0) + sample.weight);
    if (vector.process) processWeights.set(vector.process, (processWeights.get(vector.process) ?? 0) + sample.weight);
    if (vector.difficultyLabel)
      difficultyWeights.set(vector.difficultyLabel, (difficultyWeights.get(vector.difficultyLabel) ?? 0) + sample.weight);
  }

  const behavioralOriginIds = topWeighted([...originWeights.entries()], 5);
  const favoriteOriginId = profileRes.data?.favorite_origin_id ?? null;
  const preferredOriginIds = [...new Set([...(favoriteOriginId ? [favoriteOriginId] : []), ...behavioralOriginIds])].slice(0, 5);

  const behavioralProcesses = topWeighted([...processWeights.entries()], 3);
  const explicitProcesses = toSafeArray(tasteProfile?.user_taste_profile_processes).map((p) => p.process);
  const preferredProcesses = [...new Set([...explicitProcesses, ...behavioralProcesses])];

  const brewingMethodWeights = new Map<string, number>();
  for (const log of brewLogs) {
    if (log.brewing_method_id) brewingMethodWeights.set(log.brewing_method_id, (brewingMethodWeights.get(log.brewing_method_id) ?? 0) + (log.rating ?? 3));
  }
  const preferredBrewingMethodIds = topWeighted([...brewingMethodWeights.entries()], 5);

  const preferredDifficulty = topWeighted([...difficultyWeights.entries()], 1)[0] ?? null;

  const allRatings = [...brewLogs.map((l) => l.rating), ...reviews.map((r) => r.rating)].filter((r): r is number => r !== null);
  const avgRatingGiven = allRatings.length > 0 ? Math.round((allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length) * 100) / 100 : null;

  const ownsXbloom = Boolean(profileRes.data?.owns_xbloom) || Boolean(coffeeSetupRes.data?.xbloom_device_id);
  const preferredGrinderId = coffeeSetupRes.data?.grinder_id ?? profileRes.data?.favorite_grinder_id ?? null;
  const preferredDeviceId = coffeeSetupRes.data?.brewer_device_id ?? profileRes.data?.favorite_device_id ?? null;

  const payload = {
    user_id: userId,
    engine_version: ENGINE_VERSION,
    acidity: finalVector.acidity,
    sweetness: finalVector.sweetness,
    body: finalVector.body,
    bitterness: finalVector.bitterness,
    floral: finalVector.floral,
    fruity: finalVector.fruity,
    chocolate: finalVector.chocolate,
    nutty: finalVector.nutty,
    spice: finalVector.spice,
    fermented: finalVector.fermented,
    clarity: finalVector.clarity,
    roast: finalVector.roast,
    brew_ratio: finalVector.brewRatio,
    extraction: finalVector.extraction,
    difficulty: finalVector.difficulty,
    vector: sensoryVectorToArray(finalVector),
    preferred_origin_ids: preferredOriginIds,
    preferred_processes: preferredProcesses,
    preferred_roast: tasteProfile?.roast_preference ?? null,
    preferred_brewing_method_ids: preferredBrewingMethodIds,
    preferred_grinder_id: preferredGrinderId,
    preferred_device_id: preferredDeviceId,
    owns_xbloom: ownsXbloom,
    preferred_difficulty: preferredDifficulty,
    avg_rating_given: avgRatingGiven,
    signal_count: signalCount,
    computed_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from("ai_user_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select(AI_PROFILE_SELECT)
    .single();

  if (error || !upserted) {
    console.error("updateTasteProfile failed", error);
    return mapDbAiUserProfileRow({ ...payload, computed_at: payload.computed_at } as unknown as DbAiUserProfileRow);
  }

  return mapDbAiUserProfileRow(upserted as unknown as DbAiUserProfileRow);
}

/** Builds the `RecommendationContext` the pure engine needs from a (freshly computed) AI User Profile. */
function toRecommendationContext(profile: AiUserProfile): RecommendationContext {
  const preferredOriginIds = new Set(profile.preferredOriginIds);
  return {
    vector: profile.vector,
    preferredOriginIds,
    preferredProcesses: new Set(profile.preferredProcesses),
    preferredRoast: profile.preferredRoast,
    preferredBrewingMethodIds: new Set(profile.preferredBrewingMethodIds),
    preferredGrinderId: profile.preferredGrinderId,
    preferredDeviceId: profile.preferredDeviceId,
    ownsXbloom: profile.ownsXbloom,
    preferredDifficulty: profile.preferredDifficulty,
    highlyRatedOriginIds: new Set(profile.preferredOriginIds.slice(0, 2)),
  };
}

/**
 * The AI Recommendation Engine's public entry point: refreshes the
 * user's AI User Profile, scores every published recipe against it
 * (favorite coffees/origins, roast preference, brewing method, grinder,
 * brewer, xBloom ownership, previous brews, ratings, saved recipes,
 * tasting profile, extraction history, difficulty preference), and
 * returns the top-ranked recipes with a 0-100 score and why they were
 * recommended. Recipes the user already brewed or saved are excluded by
 * default.
 */
export async function getRecommendations(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number; excludeKnownRecipes?: boolean } = {},
): Promise<RecipeRecommendation[]> {
  const profile = await updateTasteProfile(supabase, userId);
  const context = toRecommendationContext(profile);

  const excludeKnown = options.excludeKnownRecipes ?? true;
  let excludeRecipeIds = new Set<string>();
  if (excludeKnown) {
    const [{ data: brewLogs }, { data: favorites }] = await Promise.all([
      supabase.from("user_brew_logs").select("recipe_id").eq("user_id", userId).not("recipe_id", "is", null),
      supabase.from("favorites").select("recipe_id").eq("user_id", userId),
    ]);
    excludeRecipeIds = new Set([
      ...(brewLogs ?? []).map((r) => r.recipe_id as string),
      ...(favorites ?? []).map((r) => r.recipe_id as string),
    ]);
  }

  const vectors = await getAllRecipeFeatureVectors(supabase, excludeRecipeIds);
  const recipeIds = vectors.map(({ vector }) => vector.recipeId);
  const boostById = new Map<string, number>();

  if (recipeIds.length > 0) {
    const { data: kindRows } = await supabase
      .from("recipes")
      .select("id, recipe_kind, verification_status")
      .in("id", recipeIds);

    for (const row of kindRows ?? []) {
      boostById.set(
        row.id as string,
        officialRecipeBoost(
          (row.recipe_kind ?? "community") as RecipeKind,
          (row.verification_status ?? "draft") as RecipeVerificationStatus,
        ),
      );
    }
  }

  const candidates: RecipeCandidate[] = vectors.map(({ vector }) => ({
    recipeId: vector.recipeId,
    vector: vector.vector,
    originId: vector.originId,
    process: vector.process,
    roastLevel: vector.roastLevel,
    brewingMethodId: vector.brewingMethodId,
    grinderId: vector.grinderId,
    deviceId: vector.deviceId,
    hasXbloomProfile: vector.hasXbloomProfile,
    difficultyLabel: vector.difficultyLabel,
    officialBoost: boostById.get(vector.recipeId) ?? 0,
  }));

  const ranked = rankRecommendations(context, candidates, options.limit ?? 10);
  const displayById = new Map(vectors.map(({ vector, display }) => [vector.recipeId, display]));

  return ranked
    .map((result) => {
      const display = displayById.get(result.recipeId);
      if (!display) return null;
      return { ...display, score: result.score, breakdown: result.breakdown, reasons: result.reasons };
    })
    .filter((r): r is RecipeRecommendation => r !== null);
}

/** The Taste Similarity Engine's public entry point: recipes most similar in taste to `recipeId`, ranked highest first. */
export async function getSimilarRecipes(
  supabase: SupabaseClient,
  recipeId: string,
  options: { limit?: number } = {},
): Promise<SimilarRecipeResult[]> {
  const target = await getRecipeFeatureVector(supabase, recipeId);
  if (!target) return [];

  const vectors = await getAllRecipeFeatureVectors(supabase, new Set([recipeId]));
  const candidates: SimilarityCandidate[] = vectors.map(({ vector }) => ({
    recipeId: vector.recipeId,
    vector: vector.vector,
    originId: vector.originId,
    process: vector.process,
    brewingMethodId: vector.brewingMethodId,
  }));

  const targetCandidate: SimilarityCandidate = {
    recipeId: target.vector.recipeId,
    vector: target.vector.vector,
    originId: target.vector.originId,
    process: target.vector.process,
    brewingMethodId: target.vector.brewingMethodId,
  };

  const ranked = rankSimilarRecipes(targetCandidate, candidates, options.limit ?? 10);
  const displayById = new Map(vectors.map(({ vector, display }) => [vector.recipeId, display]));

  return ranked
    .map((result) => {
      const display = displayById.get(result.recipeId);
      if (!display) return null;
      return { ...display, similarity: result.similarity, sharedAttributes: result.sharedAttributes };
    })
    .filter((r): r is SimilarRecipeResult => r !== null);
}

/** Loads the known-value vocabulary (origins, processes, brewing methods, devices, grinders, xBloom models) the Discovery query parser matches against. */
async function loadDiscoveryVocabulary(supabase: SupabaseClient): Promise<DiscoveryVocabulary> {
  const [{ data: origins }, { data: coffees }, { data: brewingMethods }, { data: devices }, { data: grinders }] = await Promise.all([
    supabase.from("origins").select("country"),
    supabase.from("coffees").select("process").not("process", "is", null),
    supabase.from("brewing_methods").select("id, name"),
    supabase.from("devices").select("id, name"),
    supabase.from("grinders").select("id, name"),
  ]);

  return {
    originCountries: [...new Set((origins ?? []).map((o) => o.country as string))],
    processes: [...new Set((coffees ?? []).map((c) => c.process as string).filter(Boolean))],
    brewingMethods: brewingMethods ?? [],
    devices: devices ?? [],
    grinders: grinders ?? [],
    xbloomDeviceNames: ["xBloom Studio", "xBloom Original", "xBloom Lite", "xBloom Omni"],
  };
}

/**
 * Smart Recipe Discovery's public entry point: parses a short free-text
 * query ("I like fruity Ethiopian coffees", "I want low acidity", "I
 * only own xBloom Studio", "I have a Fellow Ode grinder", "I prefer
 * washed coffees", "I want sweet V60 recipes") and returns matching
 * published recipes, ranked by how many parsed criteria they satisfy.
 */
export async function getDiscoveryResults(
  supabase: SupabaseClient,
  query: string,
  options: { limit?: number } = {},
): Promise<DiscoveryResult[]> {
  const vocabulary = await loadDiscoveryVocabulary(supabase);
  const filters = parseDiscoveryQuery(query, vocabulary);

  const vectors = await getAllRecipeFeatureVectors(supabase);
  const lookupById = <T extends { id: string; name: string }>(list: T[], id: string | null) =>
    list.find((entry) => entry.id === id)?.name ?? null;

  const candidates: DiscoveryCandidate[] = vectors.map(({ vector }) => ({
    recipeId: vector.recipeId,
    vector: vector.vector,
    originCountry: null,
    process: vector.process,
    roastLevel: vector.roastLevel,
    brewingMethodName: lookupById(vocabulary.brewingMethods, vector.brewingMethodId),
    deviceName: lookupById(vocabulary.devices, vector.deviceId),
    grinderName: lookupById(vocabulary.grinders, vector.grinderId),
    xbloomDeviceModel: null,
  }));

  // originCountry / xbloomDeviceModel need one more round-trip since they
  // aren't stored as plain ids on the feature vector.
  const { data: originRows } = await supabase
    .from("recipes")
    .select("id, coffees ( origins ( country ) ), xbloom_profiles ( device_model )")
    .in("id", vectors.map(({ vector }) => vector.recipeId));

  const originByRecipeId = new Map(
    (
      (originRows ?? []) as unknown as {
        id: string;
        coffees: { origins: { country: string } | null } | null;
        xbloom_profiles: { device_model: string | null } | null;
      }[]
    ).map((row) => [row.id, { country: row.coffees?.origins?.country ?? null, xbloomModel: row.xbloom_profiles?.device_model ?? null }]),
  );

  for (const candidate of candidates) {
    const extra = originByRecipeId.get(candidate.recipeId);
    candidate.originCountry = extra?.country ?? null;
    candidate.xbloomDeviceModel = extra?.xbloomModel ?? null;
  }

  const ranked = rankDiscoveryResults(filters, candidates, options.limit ?? 20);
  const displayById = new Map(vectors.map(({ vector, display }) => [vector.recipeId, display]));

  return ranked
    .map((result) => {
      const display = displayById.get(result.recipeId);
      if (!display) return null;
      return { ...display, matchScore: result.matchScore, matchedOn: result.matchedOn };
    })
    .filter((r): r is DiscoveryResult => r !== null);
}

export { RECOMMENDATION_WEIGHTS };
