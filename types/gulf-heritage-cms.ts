import type { GulfHeritageArticleContent } from "@/types/gulf-heritage-article-content";
import type { GulfHeritagePageImages } from "@/types/gulf-heritage-images";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";
import type {
  GulfHeritageCategorySlug,
  GulfHeritageCountrySlug,
  GulfHeritagePageKind,
  GulfHeritagePageSlug,
  GulfHeritageRoasterProfileFields,
} from "@/types/gulf-heritage";
import type { Locale } from "@/types/i18n";

/** Editorial lifecycle — maps to a future Supabase enum column. */
export type GulfHeritageContentStatus = "draft" | "published" | "archived";

/** Shared CMS columns for every Gulf Heritage content row. */
export type GulfHeritageCmsRecordBase = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  locale: Locale;
};

/** Future Supabase table names (migrations not created yet). */
export const GULF_HERITAGE_CMS_TABLES = {
  countries: "gulf_heritage_countries",
  categories: "gulf_heritage_categories",
  articles: "gulf_heritage_articles",
  roasters: "gulf_heritage_roasters",
  recipes: "gulf_heritage_recipes",
  references: "gulf_heritage_references",
  images: "gulf_heritage_images",
  pageReferences: "gulf_heritage_page_references",
  pageRecipes: "gulf_heritage_page_recipes",
} as const;

export type GulfHeritageCountryRecord = GulfHeritageCmsRecordBase & {
  heroImageUrl: string | null;
  /** Nullable until locale copy is stored in Supabase. */
  name: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type GulfHeritageCategoryRecord = GulfHeritageCmsRecordBase & {
  countrySlug: GulfHeritageCountrySlug;
  title: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  pageSlugs: readonly GulfHeritagePageSlug[];
  sortOrder: number;
};

export type GulfHeritageArticleRecord = GulfHeritageCmsRecordBase & {
  countrySlug: GulfHeritageCountrySlug;
  categorySlug: GulfHeritageCategorySlug;
  title: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  relatedPageSlugs: readonly GulfHeritagePageSlug[];
  relatedRecipeSlugs: readonly string[];
  content: GulfHeritageArticleContent;
};

export type GulfHeritageRoasterRecord = GulfHeritageCmsRecordBase & {
  countrySlug: GulfHeritageCountrySlug;
  categorySlug: GulfHeritageCategorySlug;
  title: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  relatedPageSlugs: readonly GulfHeritagePageSlug[];
  relatedRecipeSlugs: readonly string[];
  profile: GulfHeritageRoasterProfileFields;
};

export type GulfHeritageRecipeRecord = GulfHeritageCmsRecordBase & {
  countrySlug: GulfHeritageCountrySlug | null;
  pageSlug: GulfHeritagePageSlug | null;
  recipe: GulfHeritageRecipeReference;
};

export type GulfHeritageReferenceRecord = GulfHeritageCmsRecordBase & {
  countrySlug: GulfHeritageCountrySlug | null;
  pageSlug: GulfHeritagePageSlug | null;
  reference: GulfHeritageReference;
  sortOrder: number;
};

export type GulfHeritageImageRecord = GulfHeritageCmsRecordBase & {
  countrySlug: GulfHeritageCountrySlug;
  pageSlug: GulfHeritagePageSlug;
  images: GulfHeritagePageImages;
};

/** Lightweight page routing record shared by articles and roasters. */
export type GulfHeritagePageRouteRecord = {
  slug: GulfHeritagePageSlug;
  countrySlug: GulfHeritageCountrySlug;
  categorySlug: GulfHeritageCategorySlug;
  kind: GulfHeritagePageKind;
  relatedPageSlugs: readonly GulfHeritagePageSlug[];
  relatedRecipeSlugs: readonly string[];
};

/** Database row shapes (snake_case) for a future Supabase schema. */
export type GulfHeritageCountryRow = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  locale: Locale;
  hero_image_url: string | null;
  name: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
};

export type GulfHeritageCategoryRow = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  locale: Locale;
  country_id: string;
  country_slug: GulfHeritageCountrySlug;
  title: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  page_slugs: GulfHeritagePageSlug[];
  sort_order: number;
};

export type GulfHeritageArticleRow = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  locale: Locale;
  country_id: string;
  country_slug: GulfHeritageCountrySlug;
  category_id: string;
  category_slug: GulfHeritageCategorySlug;
  title: string | null;
  seo_title: string | null;
  seo_description: string | null;
  related_page_slugs: GulfHeritagePageSlug[];
  related_recipe_slugs: string[];
  content: GulfHeritageArticleContent;
};

export type GulfHeritageRoasterRow = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  locale: Locale;
  country_id: string;
  country_slug: GulfHeritageCountrySlug;
  category_id: string;
  category_slug: GulfHeritageCategorySlug;
  title: string | null;
  seo_title: string | null;
  seo_description: string | null;
  related_page_slugs: GulfHeritagePageSlug[];
  related_recipe_slugs: string[];
  profile: GulfHeritageRoasterProfileFields;
};

export type GulfHeritageRecipeRow = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  locale: Locale;
  country_slug: GulfHeritageCountrySlug | null;
  page_slug: GulfHeritagePageSlug | null;
  recipe: GulfHeritageRecipeReference;
};

export type GulfHeritageReferenceRow = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  locale: Locale;
  country_slug: GulfHeritageCountrySlug | null;
  page_slug: GulfHeritagePageSlug | null;
  reference: GulfHeritageReference;
  sort_order: number;
};

export type GulfHeritageImageRow = {
  id: string;
  slug: string;
  status: GulfHeritageContentStatus;
  published_at: string | null;
  updated_at: string;
  created_at: string;
  locale: Locale;
  country_slug: GulfHeritageCountrySlug;
  page_slug: GulfHeritagePageSlug;
  images: GulfHeritagePageImages;
};

export type GulfHeritagePageReferenceRow = {
  id: string;
  page_slug: GulfHeritagePageSlug;
  reference_id: string;
  sort_order: number;
  created_at: string;
};

export type GulfHeritagePageRecipeRow = {
  id: string;
  page_slug: GulfHeritagePageSlug;
  recipe_id: string;
  sort_order: number;
  created_at: string;
};
