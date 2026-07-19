import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";
import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";
import type { GulfHeritageImageAsset } from "@/types/gulf-heritage-images";

/** Verification lifecycle for Gulf Heritage recipes. */
export type RecipeVerificationStatus = GulfHeritageEditorialStatus | "unverified";

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

export type GulfHeritageRecipeIngredient = {
  name: string;
  amount: string | null;
  unit: string | null;
  notes: string | null;
};

export type GulfHeritageRecipeStep = {
  order: number;
  instruction: string;
  image: GulfHeritageImageAsset | null;
  duration: string | null;
};

/**
 * Gulf Heritage recipe — structured fields remain empty until verified.
 * Designed for future Supabase / CMS persistence.
 */
export type GulfHeritageRecipeReference = {
  slug: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  preparationTime: string | null;
  servingSize: string | null;
  equipmentList: readonly string[];
  ingredientsList: readonly GulfHeritageRecipeIngredient[];
  steps: readonly GulfHeritageRecipeStep[];
  tips: readonly string[];
  notes: string | null;
  warnings: readonly string[];
  references: readonly GulfHeritageReference[];
  stepImages: readonly GulfHeritageImageAsset[];
  /** Legacy flat fields — retained for migration and specialty-coffee parity. */
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
  images: readonly string[];
  verification: RecipeVerificationMetadata;
};

export function isRecipeVerified(recipe: GulfHeritageRecipeReference): boolean {
  return recipe.verification.status === "verified";
}

export function createUnverifiedRecipeReference(
  slug: string,
  title: string,
  status: RecipeVerificationStatus = "coming-soon",
): GulfHeritageRecipeReference {
  return {
    slug,
    title,
    difficulty: null,
    preparationTime: null,
    servingSize: null,
    equipmentList: [],
    ingredientsList: [],
    steps: [],
    tips: [],
    notes: null,
    warnings: [],
    references: [],
    stepImages: [],
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
    images: [],
    verification: {
      status,
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
