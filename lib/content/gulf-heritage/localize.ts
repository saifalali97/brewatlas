import type { GulfHeritageArticleContent } from "@/types/gulf-heritage-article-content";
import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";
import type { GulfHeritageRoasterProfileFields } from "@/types/gulf-heritage";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { Locale } from "@/types/i18n";
import { DEFAULT_LOCALE } from "@/types/i18n";

/** Prefer `localized` when present; otherwise fall back to `fallback`. */
export function pickLocalizedString(
  localized: string | null | undefined,
  fallback: string | null | undefined,
): string | null {
  return localized ?? fallback ?? null;
}

export function localizeGulfHeritageRecipe(
  recipe: GulfHeritageRecipeReference,
  recipeTitles: Record<string, string>,
): GulfHeritageRecipeReference {
  const localizedTitle = recipeTitles[recipe.slug];
  if (!localizedTitle) return recipe;
  return { ...recipe, title: localizedTitle };
}

function pickLocalizedRecipeSteps(
  localized: GulfHeritageRecipeReference["steps"] | undefined,
  fallback: GulfHeritageRecipeReference["steps"],
): GulfHeritageRecipeReference["steps"] {
  return localized && localized.length > 0 ? localized : fallback;
}

function pickLocalizedIngredientList(
  localized: GulfHeritageRecipeReference["ingredientsList"] | undefined,
  fallback: GulfHeritageRecipeReference["ingredientsList"],
): GulfHeritageRecipeReference["ingredientsList"] {
  return localized && localized.length > 0 ? localized : fallback;
}

function pickLocalizedStringList(
  localized: readonly string[] | undefined,
  fallback: readonly string[],
): readonly string[] {
  return localized && localized.length > 0 ? localized : fallback;
}

/** Merge locale-specific recipe fields over English base; missing Arabic fields fall back to English. */
export function localizeGulfHeritageRecipeContent(
  english: GulfHeritageRecipeReference,
  arabic: Partial<GulfHeritageRecipeReference> | null | undefined,
): GulfHeritageRecipeReference {
  if (!arabic) return english;

  return {
    ...english,
    preparationTime: pickLocalizedString(arabic.preparationTime, english.preparationTime) ?? english.preparationTime,
    servingSize: pickLocalizedString(arabic.servingSize, english.servingSize) ?? english.servingSize,
    equipmentList: pickLocalizedStringList(arabic.equipmentList, english.equipmentList),
    ingredientsList: pickLocalizedIngredientList(arabic.ingredientsList, english.ingredientsList),
    steps: pickLocalizedRecipeSteps(arabic.steps, english.steps),
    tips: pickLocalizedStringList(arabic.tips, english.tips),
    notes: pickLocalizedString(arabic.notes, english.notes),
    warnings: pickLocalizedStringList(arabic.warnings, english.warnings),
    references: arabic.references && arabic.references.length > 0 ? arabic.references : english.references,
    country: pickLocalizedString(arabic.country, english.country) ?? english.country,
    yield: pickLocalizedString(arabic.yield, english.yield) ?? english.yield,
    brewMethod: pickLocalizedString(arabic.brewMethod, english.brewMethod) ?? english.brewMethod,
    waterTemperature: pickLocalizedString(arabic.waterTemperature, english.waterTemperature) ?? english.waterTemperature,
    time: pickLocalizedString(arabic.time, english.time) ?? english.time,
    servingNotes: pickLocalizedString(arabic.servingNotes, english.servingNotes) ?? english.servingNotes,
    method: pickLocalizedString(arabic.method, english.method) ?? english.method,
    water: pickLocalizedString(arabic.water, english.water) ?? english.water,
    verification: arabic.verification ?? english.verification,
  };
}

/** Merge Arabic citation metadata when a verified Arabic primary page exists. */
export function localizeGulfHeritageReference(
  english: GulfHeritageReference,
  arabic: Partial<GulfHeritageReference> | null | undefined,
): GulfHeritageReference {
  if (!arabic) return english;

  return {
    ...english,
    sourceName: pickLocalizedString(arabic.sourceName, english.sourceName) ?? english.sourceName,
    organization: pickLocalizedString(arabic.organization, english.organization),
    publication: pickLocalizedString(arabic.publication, english.publication),
    url: arabic.url ?? english.url,
  };
}

function localizeArabicCoffeeSections(
  english: Extract<GulfHeritageArticleContent, { variant: "arabic-coffee" }>,
  arabic: Partial<Extract<GulfHeritageArticleContent, { variant: "arabic-coffee" }>> | null,
): Extract<GulfHeritageArticleContent, { variant: "arabic-coffee" }> {
  if (!arabic) return english;

  const arSections = arabic.sections ?? english.sections;
  const enSections = english.sections;

  return {
    variant: "arabic-coffee",
    intro: pickLocalizedString(arabic.intro, english.intro),
    glossary: pickLocalizedString(arabic.glossary, english.glossary),
    sections: {
      overview: pickLocalizedString(arSections.overview, enSections.overview),
      history: pickLocalizedString(arSections.history, enSections.history),
      culturalSignificance: pickLocalizedString(arSections.culturalSignificance, enSections.culturalSignificance),
      traditionalPreparation: pickLocalizedString(arSections.traditionalPreparation, enSections.traditionalPreparation),
      regionalDifferences: pickLocalizedString(arSections.regionalDifferences, enSections.regionalDifferences),
      servingEtiquette: pickLocalizedString(arSections.servingEtiquette, enSections.servingEtiquette),
      equipment: pickLocalizedString(arSections.equipment, enSections.equipment),
      ingredients: pickLocalizedString(arSections.ingredients, enSections.ingredients),
    },
  };
}

function localizeTeaKarakSections(
  english: Extract<GulfHeritageArticleContent, { variant: "tea-karak" }>,
  arabic: Partial<Extract<GulfHeritageArticleContent, { variant: "tea-karak" }>> | null,
): Extract<GulfHeritageArticleContent, { variant: "tea-karak" }> {
  if (!arabic) return english;

  const arSections = arabic.sections ?? english.sections;
  const enSections = english.sections;

  return {
    variant: "tea-karak",
    intro: pickLocalizedString(arabic.intro, english.intro),
    glossary: pickLocalizedString(arabic.glossary, english.glossary),
    sections: {
      history: pickLocalizedString(arSections.history, enSections.history),
      ingredients: pickLocalizedString(arSections.ingredients, enSections.ingredients),
      traditionalPreparation: pickLocalizedString(arSections.traditionalPreparation, enSections.traditionalPreparation),
      servingTraditions: pickLocalizedString(arSections.servingTraditions, enSections.servingTraditions),
      regionalVariations: pickLocalizedString(arSections.regionalVariations, enSections.regionalVariations),
    },
  };
}

/** Merge locale-specific editorial over English base; missing Arabic fields fall back to English. */
export function localizeGulfHeritageArticleContent(
  locale: Locale,
  english: GulfHeritageArticleContent,
  arabic: GulfHeritageArticleContent | null,
): GulfHeritageArticleContent {
  if (locale === DEFAULT_LOCALE || !arabic) return english;

  if (english.variant === "arabic-coffee" && arabic.variant === "arabic-coffee") {
    return localizeArabicCoffeeSections(english, arabic);
  }

  if (english.variant === "tea-karak" && arabic.variant === "tea-karak") {
    return localizeTeaKarakSections(english, arabic);
  }

  return english;
}

function pickLocalizedArray<T extends string>(
  localized: readonly T[] | undefined,
  fallback: readonly T[],
): readonly T[] {
  return localized && localized.length > 0 ? localized : fallback;
}

/** Merge locale-specific roaster profile over English base; missing Arabic fields fall back to English. */
export function localizeGulfHeritageRoasterProfile(
  locale: Locale,
  english: GulfHeritageRoasterProfileFields,
  arabic: Partial<GulfHeritageRoasterProfileFields> | null,
): GulfHeritageRoasterProfileFields {
  if (locale === DEFAULT_LOCALE || !arabic) return english;

  return {
    history: pickLocalizedString(arabic.history, english.history),
    founder: pickLocalizedString(arabic.founder, english.founder),
    story: pickLocalizedString(arabic.story, english.story),
    foundingYear: arabic.foundingYear ?? english.foundingYear,
    location: pickLocalizedString(arabic.location, english.location),
    branches: pickLocalizedArray(arabic.branches, english.branches),
    websiteUrl: english.websiteUrl,
    instagramUrl: english.instagramUrl,
    roastingPhilosophy: pickLocalizedString(arabic.roastingPhilosophy, english.roastingPhilosophy),
    signatureCoffees: pickLocalizedArray(arabic.signatureCoffees, english.signatureCoffees),
    coffeeLineup: pickLocalizedString(arabic.coffeeLineup, english.coffeeLineup),
    coffeeOrigins: pickLocalizedArray(arabic.coffeeOrigins, english.coffeeOrigins),
    brewingRecommendations: pickLocalizedString(arabic.brewingRecommendations, english.brewingRecommendations),
    featuredBeans: pickLocalizedString(arabic.featuredBeans, english.featuredBeans),
    awards: pickLocalizedString(arabic.awards, english.awards),
    socialLinks: english.socialLinks,
    references: english.references,
  };
}
