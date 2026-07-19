import { UAE_GULF_HERITAGE_PAGES } from "@/lib/content/gulf-heritage/uae/pages";
import type { GulfHeritagePagesRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";
import type { GulfHeritagePageRouteRecord } from "@/types/gulf-heritage-cms";
import type {
  GulfHeritageCategorySlug,
  GulfHeritageCountrySlug,
  GulfHeritagePageSlug,
} from "@/types/gulf-heritage";

function toRouteRecord(
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
  pageSlug: GulfHeritagePageSlug,
): GulfHeritagePageRouteRecord | null {
  if (countrySlug !== "united-arab-emirates") return null;

  const page = UAE_GULF_HERITAGE_PAGES.find(
    (item) => item.slug === pageSlug && item.categorySlug === categorySlug,
  );
  if (!page) return null;

  return {
    slug: page.slug,
    countrySlug,
    categorySlug: page.categorySlug,
    kind: page.kind,
    editorialStatus: page.editorialStatus,
    relatedPageSlugs: page.relatedPageSlugs,
    relatedRecipeSlugs: page.relatedRecipeSlugs,
  };
}

export const staticGulfHeritagePagesRepository: GulfHeritagePagesRepository = {
  async getRoute(countrySlug, categorySlug, pageSlug) {
    return toRouteRecord(countrySlug, categorySlug, pageSlug);
  },

  async listByCategory(countrySlug, categorySlug) {
    if (countrySlug !== "united-arab-emirates") return [];

    return UAE_GULF_HERITAGE_PAGES.filter((page) => page.categorySlug === categorySlug).map((page) => ({
      slug: page.slug,
      countrySlug,
      categorySlug: page.categorySlug,
      kind: page.kind,
      editorialStatus: page.editorialStatus,
      relatedPageSlugs: page.relatedPageSlugs,
      relatedRecipeSlugs: page.relatedRecipeSlugs,
    }));
  },
};
