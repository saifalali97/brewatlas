import type { GulfHeritageArticleContent } from "@/types/gulf-heritage-article-content";
import type { GulfHeritagePageImages } from "@/types/gulf-heritage-images";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";

/** Slugs for Gulf Heritage country routes (`/gulf-heritage/[country]`). */
export type GulfHeritageCountrySlug =
  | "united-arab-emirates"
  | "saudi-arabia"
  | "oman"
  | "kuwait"
  | "qatar"
  | "bahrain";

/** UAE content categories (`/gulf-heritage/united-arab-emirates/[category]`). */
export type GulfHeritageCategorySlug = "arabic-coffee" | "tea-karak" | "uae-roasters";

/** Article pages under Arabic Coffee. */
export type GulfHeritageArabicCoffeePageSlug =
  | "emirati-arabic-coffee"
  | "dallah"
  | "finjan"
  | "mihmas"
  | "cardamom"
  | "saffron"
  | "coffee-hospitality"
  | "coffee-etiquette"
  | "coffee-serving-traditions";

/** Article pages under Tea & Karak. */
export type GulfHeritageTeaKarakPageSlug =
  | "karak-chai"
  | "black-tea"
  | "milk-tea"
  | "saffron-tea"
  | "mint-tea"
  | "adani-tea";

/** Roaster profile pages under UAE Roasters. */
export type GulfHeritageRoasterPageSlug =
  | "raw-coffee-company"
  | "the-espresso-lab"
  | "seven-fortunes"
  | "cypher-roastery"
  | "boom-coffee"
  | "gold-box-roastery"
  | "nightjar-coffee";

export type GulfHeritagePageSlug =
  | GulfHeritageArabicCoffeePageSlug
  | GulfHeritageTeaKarakPageSlug
  | GulfHeritageRoasterPageSlug;

export type GulfHeritagePageKind = "article" | "roaster";

export type GulfHeritageCategoryConfig = {
  slug: GulfHeritageCategorySlug;
  pageSlugs: readonly GulfHeritagePageSlug[];
};

export type GulfHeritageCountryConfig = {
  slug: GulfHeritageCountrySlug;
  /** Nested categories (UAE). Other countries may omit this. */
  categories?: readonly GulfHeritageCategoryConfig[];
  heroImageUrl?: string;
};

export type GulfHeritagePageDefinition = {
  slug: GulfHeritagePageSlug;
  categorySlug: GulfHeritageCategorySlug;
  kind: GulfHeritagePageKind;
  /** Related page slugs within the same country (resolved at runtime). */
  relatedPageSlugs: readonly GulfHeritagePageSlug[];
  /** Recipe slugs reserved for verified content — empty until sourced. */
  relatedRecipeSlugs: readonly string[];
};

/** Roaster profile field slots — null until verified from primary sources. */
export type GulfHeritageRoasterProfileFields = {
  story: string | null;
  foundingYear: number | null;
  location: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  roastingPhilosophy: string | null;
  coffeeLineup: string | null;
  brewingRecommendations: string | null;
  featuredBeans: string | null;
  awards: string | null;
  socialLinks: ReadonlyArray<{ label: string; url: string }>;
};

export type GulfHeritageCountryCopy = {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type GulfHeritageCategoryCopy = {
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type GulfHeritagePageCopy = {
  title: string;
  seoTitle: string;
  seoDescription: string;
};

export type GulfHeritageResolvedPage = {
  countrySlug: GulfHeritageCountrySlug;
  categorySlug: GulfHeritageCategorySlug;
  definition: GulfHeritagePageDefinition;
  copy: GulfHeritagePageCopy;
  categoryCopy: GulfHeritageCategoryCopy;
  countryCopy: GulfHeritageCountryCopy;
  relatedPages: Array<{ slug: GulfHeritagePageSlug; copy: GulfHeritagePageCopy; href: string }>;
  relatedRecipes: GulfHeritageRecipeReference[];
  verifiedRecipes: GulfHeritageRecipeReference[];
  articleContent: GulfHeritageArticleContent | null;
  references: readonly GulfHeritageReference[];
  images: GulfHeritagePageImages;
  roasterFields: GulfHeritageRoasterProfileFields | null;
};

export const GULF_HERITAGE_HUB_PATH = "/gulf-heritage" as const;

export function gulfHeritageCategoryPath(
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
): string {
  return `/gulf-heritage/${countrySlug}/${categorySlug}`;
}

export function gulfHeritagePagePath(
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
  pageSlug: GulfHeritagePageSlug,
): string {
  return `/gulf-heritage/${countrySlug}/${categorySlug}/${pageSlug}`;
}
