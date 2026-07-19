import { GULF_HERITAGE_COUNTRIES } from "@/lib/content/gulf-heritage/config";
import { createStaticCmsBase } from "@/lib/content/gulf-heritage/cms/repositories/static/cms-base";
import type { GulfHeritageCategoriesRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";
import type { GulfHeritageCategoryRecord } from "@/types/gulf-heritage-cms";
import type { GulfHeritageCategoryConfig, GulfHeritageCategorySlug, GulfHeritageCountrySlug } from "@/types/gulf-heritage";
import type { Locale } from "@/types/i18n";

function getCountryCategories(countrySlug: GulfHeritageCountrySlug): readonly GulfHeritageCategoryConfig[] {
  const country = GULF_HERITAGE_COUNTRIES.find((item) => item.slug === countrySlug);
  if (!country || !("categories" in country) || !country.categories) return [];
  return country.categories;
}

function toCategoryRecord(
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
  locale: Locale,
  sortOrder: number,
): GulfHeritageCategoryRecord | null {
  const categories = getCountryCategories(countrySlug);
  const category = categories.find((item) => item.slug === categorySlug);
  if (!category) return null;

  return {
    ...createStaticCmsBase("category", `${countrySlug}:${categorySlug}`, locale),
    countrySlug,
    title: null,
    description: null,
    seoTitle: null,
    seoDescription: null,
    pageSlugs: category.pageSlugs,
    sortOrder,
  };
}

export const staticGulfHeritageCategoriesRepository: GulfHeritageCategoriesRepository = {
  async listByCountry(countrySlug, locale) {
    const categories = getCountryCategories(countrySlug);
    return categories.flatMap((category, index) => {
      const record = toCategoryRecord(countrySlug, category.slug, locale, index);
      return record ? [record] : [];
    });
  },

  async getBySlug(countrySlug, categorySlug, locale) {
    const categories = getCountryCategories(countrySlug);
    const index = categories.findIndex((item) => item.slug === categorySlug);
    if (index === -1) return null;
    return toCategoryRecord(countrySlug, categorySlug, locale, index);
  },
};
