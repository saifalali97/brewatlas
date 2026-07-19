import type {
  GulfHeritageArticleRecord,
  GulfHeritageCategoryRecord,
  GulfHeritageCountryRecord,
  GulfHeritageImageRecord,
  GulfHeritagePageRouteRecord,
  GulfHeritageRecipeRecord,
  GulfHeritageReferenceRecord,
  GulfHeritageRoasterRecord,
} from "@/types/gulf-heritage-cms";
import type {
  GulfHeritageCategorySlug,
  GulfHeritageCountrySlug,
  GulfHeritagePageSlug,
} from "@/types/gulf-heritage";
import type { Locale } from "@/types/i18n";

export type GulfHeritageCountriesRepository = {
  list(locale: Locale): Promise<readonly GulfHeritageCountryRecord[]>;
  getBySlug(slug: GulfHeritageCountrySlug, locale: Locale): Promise<GulfHeritageCountryRecord | null>;
};

export type GulfHeritageCategoriesRepository = {
  listByCountry(
    countrySlug: GulfHeritageCountrySlug,
    locale: Locale,
  ): Promise<readonly GulfHeritageCategoryRecord[]>;
  getBySlug(
    countrySlug: GulfHeritageCountrySlug,
    categorySlug: GulfHeritageCategorySlug,
    locale: Locale,
  ): Promise<GulfHeritageCategoryRecord | null>;
};

export type GulfHeritageArticlesRepository = {
  getBySlug(
    countrySlug: GulfHeritageCountrySlug,
    categorySlug: GulfHeritageCategorySlug,
    pageSlug: GulfHeritagePageSlug,
    locale: Locale,
  ): Promise<GulfHeritageArticleRecord | null>;
  listByCategory(
    countrySlug: GulfHeritageCountrySlug,
    categorySlug: GulfHeritageCategorySlug,
    locale: Locale,
  ): Promise<readonly GulfHeritageArticleRecord[]>;
};

export type GulfHeritageRoastersRepository = {
  getBySlug(
    countrySlug: GulfHeritageCountrySlug,
    categorySlug: GulfHeritageCategorySlug,
    pageSlug: GulfHeritagePageSlug,
    locale: Locale,
  ): Promise<GulfHeritageRoasterRecord | null>;
  listByCategory(
    countrySlug: GulfHeritageCountrySlug,
    categorySlug: GulfHeritageCategorySlug,
    locale: Locale,
  ): Promise<readonly GulfHeritageRoasterRecord[]>;
};

export type GulfHeritageRecipesRepository = {
  listByPage(pageSlug: GulfHeritagePageSlug, locale: Locale): Promise<readonly GulfHeritageRecipeRecord[]>;
};

export type GulfHeritageReferencesRepository = {
  listByPage(pageSlug: GulfHeritagePageSlug, locale: Locale): Promise<readonly GulfHeritageReferenceRecord[]>;
};

export type GulfHeritageImagesRepository = {
  getByPage(
    countrySlug: GulfHeritageCountrySlug,
    pageSlug: GulfHeritagePageSlug,
    locale: Locale,
  ): Promise<GulfHeritageImageRecord | null>;
};

export type GulfHeritagePagesRepository = {
  getRoute(
    countrySlug: GulfHeritageCountrySlug,
    categorySlug: GulfHeritageCategorySlug,
    pageSlug: GulfHeritagePageSlug,
  ): Promise<GulfHeritagePageRouteRecord | null>;
  listByCategory(
    countrySlug: GulfHeritageCountrySlug,
    categorySlug: GulfHeritageCategorySlug,
  ): Promise<readonly GulfHeritagePageRouteRecord[]>;
};

export type GulfHeritageCmsRepositories = {
  countries: GulfHeritageCountriesRepository;
  categories: GulfHeritageCategoriesRepository;
  articles: GulfHeritageArticlesRepository;
  roasters: GulfHeritageRoastersRepository;
  recipes: GulfHeritageRecipesRepository;
  references: GulfHeritageReferencesRepository;
  images: GulfHeritageImagesRepository;
  pages: GulfHeritagePagesRepository;
};
