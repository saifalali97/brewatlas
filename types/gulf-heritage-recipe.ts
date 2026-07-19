/** Verification lifecycle for Gulf Heritage and editorial recipes. */
export type RecipeVerificationStatus = "unverified" | "pending" | "verified";

export type RecipeVerificationMetadata = {
  status: RecipeVerificationStatus;
  sourceName: string | null;
  sourceUrl: string | null;
  originalAuthor: string | null;
  publication: string | null;
  publishedDate: string | null;
  lastVerified: string | null;
  recipeVersion: string | null;
};

/**
 * Gulf Heritage recipe — all fields remain nullable until verified.
 * Designed for future Supabase / CMS persistence.
 */
export type GulfHeritageRecipeReference = {
  slug: string;
  title: string;
  country: string | null;
  region: string | null;
  yield: string | null;
  brewMethod: string | null;
  equipment: string | null;
  ingredients: string | null;
  preparationSteps: string | null;
  waterTemperature: string | null;
  time: string | null;
  servingNotes: string | null;
  /** Legacy specialty-coffee fields — nullable until verified. */
  method: string | null;
  coffee: string | null;
  grinder: string | null;
  grindSize: string | null;
  water: string | null;
  coffeeDose: number | null;
  waterRatio: string | null;
  bloom: string | null;
  pourSchedule: string | null;
  brewTime: string | null;
  tds: number | null;
  extractionYield: number | null;
  notes: string | null;
  images: readonly string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  verification: RecipeVerificationMetadata;
};

export function isRecipeVerified(recipe: GulfHeritageRecipeReference): boolean {
  return recipe.verification.status === "verified";
}

export function createUnverifiedRecipeReference(
  slug: string,
  title: string,
): GulfHeritageRecipeReference {
  return {
    slug,
    title,
    country: null,
    region: null,
    yield: null,
    brewMethod: null,
    equipment: null,
    ingredients: null,
    preparationSteps: null,
    waterTemperature: null,
    time: null,
    servingNotes: null,
    method: null,
    coffee: null,
    grinder: null,
    grindSize: null,
    water: null,
    coffeeDose: null,
    waterRatio: null,
    bloom: null,
    pourSchedule: null,
    brewTime: null,
    tds: null,
    extractionYield: null,
    notes: null,
    images: [],
    difficulty: null,
    verification: {
      status: "unverified",
      sourceName: null,
      sourceUrl: null,
      originalAuthor: null,
      publication: null,
      publishedDate: null,
      lastVerified: null,
      recipeVersion: null,
    },
  };
}
