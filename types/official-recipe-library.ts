/**
 * Official BrewAtlas Recipe Library — canonical data model types.
 * Maps to public.recipes, recipe_pours, recipe_translations, and related lookups.
 */

import type { RecipeKind, RecipeVerificationStatus } from "@/types/official-recipe";
import type { RecipeImageRow, TagRow } from "@/types/recipe";

/** Supported official library brewing method slugs (see brewing_methods seed). */
export const OFFICIAL_BREWING_METHOD_SLUGS = [
  "v60",
  "origami",
  "orea",
  "kalita",
  "chemex",
  "aeropress",
  "french-press",
  "espresso",
  "cold-brew",
  "xbloom",
  "batch-brew",
] as const;

export type OfficialBrewingMethodSlug = (typeof OFFICIAL_BREWING_METHOD_SLUGS)[number];

export const RECIPE_SERVING_STYLES = ["hot", "iced"] as const;
export type RecipeServingStyle = (typeof RECIPE_SERVING_STYLES)[number];

export const RECIPE_SOURCE_VERIFICATION_STATUSES = [
  "unverified",
  "pending",
  "verified",
  "rejected",
] as const;
export type RecipeSourceVerificationStatus = (typeof RECIPE_SOURCE_VERIFICATION_STATUSES)[number];

/** Extended pour step for the official recipe library (camelCase API shape). */
export type OfficialRecipePour = {
  id: string;
  pourNumber: number;
  waterAmount: number | null;
  timeLabel: string | null;
  notes: string | null;
  durationSeconds: number | null;
  agitation: string | null;
  pourTarget: string | null;
};

export type OfficialRecipePourTranslation = {
  pourId: string;
  locale: string;
  notes: string | null;
  agitation: string | null;
  pourTarget: string | null;
  isMachineTranslated: boolean;
};

export type OfficialRecipeTranslation = {
  locale: string;
  title: string | null;
  description: string | null;
  brewNotes: string | null;
  tastingNotes: string | null;
  tips: string | null;
  warnings: string | null;
  steps: string | null;
  agitationInstructions: string | null;
  drawdownTarget: string | null;
  aiSummary: string | null;
  isMachineTranslated: boolean;
};

/** Full official library record — superset used by read/write APIs. */
export type OfficialRecipeLibraryRecord = {
  id: string;
  slug: string;
  title: string;
  description: string | null;

  /** Roastery */
  roasterId: string | null;
  roasterName: string | null;
  roasterSlug: string | null;
  roasterCountry: string | null;

  /** Coffee bean + origin country */
  coffeeId: string | null;
  coffeeName: string | null;
  originId: string | null;
  originCountry: string | null;
  originRegion: string | null;
  farm: string | null;
  producer: string | null;
  variety: string | null;
  process: string | null;
  roastLevel: string | null;

  /** Brewing setup */
  brewingMethodId: string | null;
  brewingMethodName: string | null;
  brewingMethodSlug: string | null;
  servingStyle: RecipeServingStyle;
  deviceId: string | null;
  deviceName: string | null;
  grinderId: string | null;
  grinderName: string | null;
  grindSize: string | null;
  grinderSetting: string | null;

  /** Brew parameters */
  coffeeDose: number | null;
  waterAmount: number | null;
  iceAmount: number | null;
  waterTemperature: number | null;
  bloomAmount: number | null;
  bloomTime: string | null;
  totalBrewTime: string | null;
  ratio: string | null;
  agitationInstructions: string | null;
  drawdownTarget: string | null;
  pourStructure: string | null;
  pours: OfficialRecipePour[];

  /** Results */
  tastingNotes: string | null;
  beverageWeight: number | null;
  tds: number | null;
  extractionPercentage: number | null;

  /** Authorship & verification */
  authorId: string | null;
  recipeAuthorName: string | null;
  sourceUrl: string | null;
  sourceVerificationStatus: RecipeSourceVerificationStatus;
  sourceVerifiedAt: string | null;
  sourceVerifiedBy: string | null;
  recipeKind: RecipeKind;
  verificationStatus: RecipeVerificationStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  versionLabel: string;

  /** Presentation */
  featured: boolean;
  premiumOnly: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  coverImageUrl: string | null;
  images: RecipeImageRow[];
  tags: TagRow[];

  /** i18n */
  translations: OfficialRecipeTranslation[];
  defaultLocale: string;
};

export type OfficialRecipeLibraryFilters = {
  roasterId?: string;
  brewingMethodId?: string;
  servingStyle?: RecipeServingStyle;
  country?: string;
  verifiedOnly?: boolean;
  featuredOnly?: boolean;
  search?: string;
};

export type OfficialRecipeLibraryWriteInput = {
  title: string;
  slug?: string | null;
  description?: string | null;
  roasterId?: string | null;
  coffeeId?: string | null;
  brewingMethodId: string;
  servingStyle: RecipeServingStyle;
  deviceId?: string | null;
  grinderId?: string | null;
  grindSize?: string | null;
  grinderSetting?: string | null;
  coffeeDose?: number | null;
  waterAmount?: number | null;
  iceAmount?: number | null;
  waterTemperature?: number | null;
  bloomAmount?: number | null;
  bloomTime?: string | null;
  totalBrewTime?: string | null;
  ratio?: string | null;
  agitationInstructions?: string | null;
  drawdownTarget?: string | null;
  pourStructure?: string | null;
  pours?: Array<{
    pourNumber: number;
    waterAmount?: number | null;
    timeLabel?: string | null;
    durationSeconds?: number | null;
    notes?: string | null;
    agitation?: string | null;
    pourTarget?: string | null;
  }>;
  tastingNotes?: string | null;
  instructions?: string | null;
  recipeAuthorName?: string | null;
  sourceUrl?: string | null;
  sourceVerificationStatus?: RecipeSourceVerificationStatus;
  recipeKind?: RecipeKind;
  verificationStatus?: RecipeVerificationStatus;
  versionLabel?: string;
  featured?: boolean;
  premiumOnly?: boolean;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | null;
};

export function isIcedServingStyle(style: RecipeServingStyle): boolean {
  return style === "iced";
}

export function isBrewAtlasVerified(status: RecipeVerificationStatus): boolean {
  return status === "verified" || status === "competition_tested";
}

export function isSourceVerified(status: RecipeSourceVerificationStatus): boolean {
  return status === "verified";
}
