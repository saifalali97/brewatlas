import { UAE_GULF_HERITAGE_PAGES } from "@/lib/content/gulf-heritage/uae/pages";
import { getGulfHeritageContentService } from "@/lib/content/gulf-heritage/cms/provider";
import type {
  GulfHeritageCategoryConfig,
  GulfHeritageCategoryCopy,
  GulfHeritageCategorySlug,
  GulfHeritageCountryCopy,
  GulfHeritageCountrySlug,
  GulfHeritagePageCopy,
  GulfHeritagePageDefinition,
  GulfHeritagePageSlug,
  GulfHeritageResolvedPage,
} from "@/types/gulf-heritage";
import { GULF_HERITAGE_COUNTRIES } from "@/lib/content/gulf-heritage/config";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";

export { GULF_HERITAGE_COUNTRIES } from "@/lib/content/gulf-heritage/config";
export { GULF_HERITAGE_HUB_PATH, gulfHeritageCategoryPath } from "@/types/gulf-heritage";
export {
  getGulfHeritageCmsRepositories,
  getGulfHeritageContentService,
} from "@/lib/content/gulf-heritage/cms/provider";

export function getGulfHeritageCountryConfig(slug: string) {
  return GULF_HERITAGE_COUNTRIES.find((country) => country.slug === slug);
}

export function getGulfHeritageCountryCopy(
  dictionary: Dictionary,
  slug: GulfHeritageCountrySlug,
): GulfHeritageCountryCopy {
  return dictionary.gulfHeritagePage.countries[slug];
}

export function getGulfHeritageCategoryCopy(
  dictionary: Dictionary,
  slug: GulfHeritageCategorySlug,
): GulfHeritageCategoryCopy {
  return dictionary.gulfHeritagePage.categories[slug];
}

export function getGulfHeritagePageCopy(
  dictionary: Dictionary,
  slug: GulfHeritagePageSlug,
): GulfHeritagePageCopy {
  return dictionary.gulfHeritagePage.pages[slug];
}

export function isGulfHeritageCountrySlug(slug: string): slug is GulfHeritageCountrySlug {
  return GULF_HERITAGE_COUNTRIES.some((country) => country.slug === slug);
}

export function getGulfHeritageCountryCategories(countrySlug: string): readonly GulfHeritageCategoryConfig[] {
  const country = getGulfHeritageCountryConfig(countrySlug);
  if (!country || !("categories" in country) || !country.categories) return [];
  return country.categories;
}

export function getGulfHeritageCategoryConfig(
  countrySlug: string,
  categorySlug: string,
): GulfHeritageCategoryConfig | null {
  return getGulfHeritageCountryCategories(countrySlug).find((category) => category.slug === categorySlug) ?? null;
}

export function getGulfHeritagePageDefinition(
  countrySlug: string,
  categorySlug: string,
  pageSlug: string,
): GulfHeritagePageDefinition | null {
  if (countrySlug !== "united-arab-emirates") return null;
  const page = UAE_GULF_HERITAGE_PAGES.find(
    (item) => item.slug === pageSlug && item.categorySlug === categorySlug,
  );
  return page ?? null;
}

export async function resolveGulfHeritagePage(
  dictionary: Dictionary,
  countrySlug: string,
  categorySlug: string,
  pageSlug: string,
  locale?: Locale,
): Promise<GulfHeritageResolvedPage | null> {
  return getGulfHeritageContentService().resolvePage(
    dictionary,
    countrySlug,
    categorySlug,
    pageSlug,
    locale,
  );
}

export function listGulfHeritageStaticCategoryParams() {
  return GULF_HERITAGE_COUNTRIES.flatMap((country) =>
    getGulfHeritageCountryCategories(country.slug).map((category) => ({
      country: country.slug,
      category: category.slug,
    })),
  );
}

export function listGulfHeritageStaticPageParams() {
  return GULF_HERITAGE_COUNTRIES.flatMap((country) =>
    getGulfHeritageCountryCategories(country.slug).flatMap((category) =>
      category.pageSlugs.map((page) => ({
        country: country.slug,
        category: category.slug,
        page,
      })),
    ),
  );
}

export function getGulfHeritageGuideCount(countrySlug: string): number {
  return getGulfHeritageCountryCategories(countrySlug).reduce(
    (total, category) => total + category.pageSlugs.length,
    0,
  );
}

export function listGulfHeritageSitemapPaths(): Array<{ path: string; priority: number }> {
  const paths: Array<{ path: string; priority: number }> = [{ path: "/gulf-heritage", priority: 0.7 }];

  for (const country of GULF_HERITAGE_COUNTRIES) {
    paths.push({ path: `/gulf-heritage/${country.slug}`, priority: 0.65 });

    for (const category of getGulfHeritageCountryCategories(country.slug)) {
      paths.push({
        path: `/gulf-heritage/${country.slug}/${category.slug}`,
        priority: 0.62,
      });

      for (const page of category.pageSlugs) {
        paths.push({
          path: `/gulf-heritage/${country.slug}/${category.slug}/${page}`,
          priority: 0.58,
        });
      }
    }
  }

  return paths;
}
