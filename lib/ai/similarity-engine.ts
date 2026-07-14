import { SENSORY_VECTOR_DIMENSIONS, type SensoryVector, type SimilarRecipeScore } from "@/types/ai";

/**
 * The BrewAtlas Taste Similarity Engine: pure, deterministic vector-math
 * functions comparing two recipes' sensory feature vectors (origin,
 * processing, roast, body, acidity, sweetness, bitterness, floral,
 * fruity, chocolate, nutty, spice, fermentation, brew ratio, extraction
 * -- see `SENSORY_VECTOR_DIMENSIONS`). No I/O; `lib/data/ai.ts` supplies
 * the actual recipe vectors from the database.
 */

/** Cosine similarity between two sensory vectors, 0 (unrelated) - 1 (identical direction). */
export function cosineSimilarity(a: SensoryVector, b: SensoryVector): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const dimension of SENSORY_VECTOR_DIMENSIONS) {
    dot += a[dimension] * b[dimension];
    magA += a[dimension] ** 2;
    magB += b[dimension] ** 2;
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/** Normalized Euclidean similarity (1 - distance/maxDistance) between two sensory vectors, 0-1. */
export function euclideanSimilarity(a: SensoryVector, b: SensoryVector): number {
  let sumSquares = 0;
  for (const dimension of SENSORY_VECTOR_DIMENSIONS) {
    sumSquares += (a[dimension] - b[dimension]) ** 2;
  }
  const distance = Math.sqrt(sumSquares);
  const maxDistance = Math.sqrt(SENSORY_VECTOR_DIMENSIONS.length); // every dimension off by the max of 1.0
  return 1 - distance / maxDistance;
}

/** Overall taste similarity: an equal blend of cosine (direction) and Euclidean (magnitude) similarity, 0-1. */
export function tasteSimilarity(a: SensoryVector, b: SensoryVector): number {
  return (cosineSimilarity(a, b) + euclideanSimilarity(a, b)) / 2;
}

const SHARED_ATTRIBUTE_THRESHOLD = 0.15;

/** Dimensions where two vectors are close enough to call "shared", for a human-readable "why similar" list. */
export function sharedSensoryAttributes(a: SensoryVector, b: SensoryVector): string[] {
  return SENSORY_VECTOR_DIMENSIONS.filter((dimension) => Math.abs(a[dimension] - b[dimension]) <= SHARED_ATTRIBUTE_THRESHOLD);
}

export type SimilarityCandidate = {
  recipeId: string;
  vector: SensoryVector;
  originId: string | null;
  process: string | null;
  brewingMethodId: string | null;
};

/**
 * Ranks candidate recipes by taste similarity to `target`, highest first.
 * Categorical matches (same origin/process/brewing method) each add a
 * small boost on top of the sensory similarity so two recipes with
 * near-identical flavor but from the same origin/process edge out a
 * purely coincidental sensory match.
 */
export function rankSimilarRecipes(
  target: SimilarityCandidate,
  candidates: SimilarityCandidate[],
  limit = 10,
): SimilarRecipeScore[] {
  const CATEGORICAL_BOOST = 0.03;

  return candidates
    .filter((candidate) => candidate.recipeId !== target.recipeId)
    .map((candidate) => {
      let similarity = tasteSimilarity(target.vector, candidate.vector);
      const sharedAttributes = sharedSensoryAttributes(target.vector, candidate.vector);

      if (target.originId && target.originId === candidate.originId) {
        similarity += CATEGORICAL_BOOST;
        sharedAttributes.push("origin");
      }
      if (target.process && candidate.process && target.process === candidate.process) {
        similarity += CATEGORICAL_BOOST;
        sharedAttributes.push("processing");
      }
      if (target.brewingMethodId && target.brewingMethodId === candidate.brewingMethodId) {
        similarity += CATEGORICAL_BOOST;
        sharedAttributes.push("brewing method");
      }

      return {
        recipeId: candidate.recipeId,
        similarity: Math.round(Math.min(1, similarity) * 1000) / 1000,
        sharedAttributes,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
