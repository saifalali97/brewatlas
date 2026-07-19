/** Editorial section slots for Arabic Coffee guides — body text null until verified. */
export type GulfHeritageArabicCoffeeSectionKey =
  | "overview"
  | "history"
  | "culturalSignificance"
  | "traditionalPreparation"
  | "regionalDifferences"
  | "servingEtiquette"
  | "equipment"
  | "ingredients";

export type GulfHeritageArabicCoffeeSections = Record<GulfHeritageArabicCoffeeSectionKey, string | null>;

/** Editorial section slots for Tea & Karak guides — body text null until verified. */
export type GulfHeritageTeaKarakSectionKey =
  | "history"
  | "ingredients"
  | "traditionalPreparation"
  | "servingTraditions"
  | "regionalVariations";

export type GulfHeritageTeaKarakSections = Record<GulfHeritageTeaKarakSectionKey, string | null>;

export type GulfHeritageArabicCoffeeArticleContent = {
  variant: "arabic-coffee";
  intro: string | null;
  /** Term definitions transcribed from verified sources, when relevant. */
  glossary: string | null;
  sections: GulfHeritageArabicCoffeeSections;
};

export type GulfHeritageTeaKarakArticleContent = {
  variant: "tea-karak";
  intro: string | null;
  /** Term definitions transcribed from verified sources, when relevant. */
  glossary: string | null;
  sections: GulfHeritageTeaKarakSections;
};

export type GulfHeritageArticleContent =
  | GulfHeritageArabicCoffeeArticleContent
  | GulfHeritageTeaKarakArticleContent;

export const ARABIC_COFFEE_SECTION_KEYS = [
  "overview",
  "history",
  "culturalSignificance",
  "traditionalPreparation",
  "regionalDifferences",
  "servingEtiquette",
  "equipment",
  "ingredients",
] as const satisfies readonly GulfHeritageArabicCoffeeSectionKey[];

export const TEA_KARAK_SECTION_KEYS = [
  "history",
  "ingredients",
  "traditionalPreparation",
  "servingTraditions",
  "regionalVariations",
] as const satisfies readonly GulfHeritageTeaKarakSectionKey[];

export function createEmptyArabicCoffeeSections(): GulfHeritageArabicCoffeeSections {
  return {
    overview: null,
    history: null,
    culturalSignificance: null,
    traditionalPreparation: null,
    regionalDifferences: null,
    servingEtiquette: null,
    equipment: null,
    ingredients: null,
  };
}

export function createEmptyTeaKarakSections(): GulfHeritageTeaKarakSections {
  return {
    history: null,
    ingredients: null,
    traditionalPreparation: null,
    servingTraditions: null,
    regionalVariations: null,
  };
}
