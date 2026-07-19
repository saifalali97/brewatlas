import { getUaeRoasterProfileFields } from "@/lib/content/gulf-heritage/uae/roasters";
import { staticGulfHeritagePagesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/pages.repository";
import { createStaticCmsBase } from "@/lib/content/gulf-heritage/cms/repositories/static/cms-base";
import type { GulfHeritageRoastersRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";
import type { GulfHeritageRoasterRecord } from "@/types/gulf-heritage-cms";
import type {
  GulfHeritageCategorySlug,
  GulfHeritageCountrySlug,
  GulfHeritagePageSlug,
  GulfHeritageRoasterPageSlug,
} from "@/types/gulf-heritage";
import type { Locale } from "@/types/i18n";

async function toRoasterRecord(
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
  pageSlug: GulfHeritagePageSlug,
  locale: Locale,
): Promise<GulfHeritageRoasterRecord | null> {
  const route = await staticGulfHeritagePagesRepository.getRoute(countrySlug, categorySlug, pageSlug);
  if (!route || route.kind !== "roaster") return null;

  const profile = getUaeRoasterProfileFields(pageSlug as GulfHeritageRoasterPageSlug, locale);

  return {
    ...createStaticCmsBase("roaster", `${countrySlug}:${categorySlug}:${pageSlug}`, locale),
    countrySlug,
    categorySlug,
    editorialStatus: route.editorialStatus,
    title: null,
    intro: profile.history ?? profile.story,
    seoTitle: null,
    seoDescription: null,
    relatedPageSlugs: route.relatedPageSlugs,
    relatedRecipeSlugs: route.relatedRecipeSlugs,
    profile,
  };
}

export const staticGulfHeritageRoastersRepository: GulfHeritageRoastersRepository = {
  async getBySlug(countrySlug, categorySlug, pageSlug, locale) {
    return toRoasterRecord(countrySlug, categorySlug, pageSlug, locale);
  },

  async listByCategory(countrySlug, categorySlug, locale) {
    const routes = await staticGulfHeritagePagesRepository.listByCategory(countrySlug, categorySlug);
    const roasters = await Promise.all(
      routes
        .filter((route) => route.kind === "roaster")
        .map((route) => toRoasterRecord(countrySlug, categorySlug, route.slug, locale)),
    );
    return roasters.filter((record): record is GulfHeritageRoasterRecord => record !== null);
  },
};
