/**
 * Official Recipe Library — curated, versioned, verified recipes.
 */

export const RECIPE_KINDS = ["official", "community", "imported", "competition", "archived"] as const;
export type RecipeKind = (typeof RECIPE_KINDS)[number];

export const RECIPE_VERIFICATION_STATUSES = [
  "draft",
  "testing",
  "verified",
  "competition_tested",
  "archived",
] as const;
export type RecipeVerificationStatus = (typeof RECIPE_VERIFICATION_STATUSES)[number];

export type OfficialRecipeFaqItem = {
  question: string;
  answer: string;
};

/** Editorial fields stored on official (and optionally other) recipes. */
export type OfficialRecipeContent = {
  recipeKind: RecipeKind;
  verificationStatus: RecipeVerificationStatus;
  versionLabel: string;
  recipeScience: string | null;
  whyItWorks: string | null;
  commonMistakes: string | null;
  adjustments: string | null;
  faq: OfficialRecipeFaqItem[];
  pourStructure: string | null;
  finishNotes: string | null;
  grinderRecommendation: string | null;
  waterRecommendation: string | null;
  equipmentNotes: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  servingStyle: "hot" | "iced";
  grinderSetting: string | null;
  agitationInstructions: string | null;
  drawdownTarget: string | null;
  sourceUrl: string | null;
  sourceVerificationStatus: "unverified" | "pending" | "verified" | "rejected";
  sourceVerifiedAt: string | null;
  recipeAuthorName: string | null;
};

export type OfficialRecipeVersionMeta = {
  versionLabel: string | null;
  changeReason: string | null;
  brewingChanges: string | null;
  versionAuthorId: string | null;
  versionAuthorName: string | null;
};

export type OfficialRecipeListFilters = {
  recipeKind?: RecipeKind;
  verificationStatus?: RecipeVerificationStatus;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  originId?: string;
  brewingMethodId?: string;
  process?: string;
  roasterId?: string;
  servingStyle?: "hot" | "iced";
  difficulty?: string;
  country?: string;
  search?: string;
};

export type OfficialRecipeSummary = {
  id: string;
  slug: string;
  title: string;
  recipeKind: RecipeKind;
  verificationStatus: RecipeVerificationStatus;
  versionLabel: string;
  featured: boolean;
  premiumOnly: boolean;
  coverImageUrl: string | null;
  brewingMethodName: string | null;
  deviceName: string | null;
  originLabel: string | null;
  roasterName: string | null;
  difficulty: string | null;
  tastingNotes: string | null;
  servingStyle: "hot" | "iced";
  updatedAt: string;
};

export function isVerifiedOfficialRecipe(
  kind: RecipeKind,
  status: RecipeVerificationStatus,
): boolean {
  return kind === "official" && (status === "verified" || status === "competition_tested");
}

export function isOfficialLibraryRecipe(kind: RecipeKind): boolean {
  return kind === "official" || kind === "competition";
}
