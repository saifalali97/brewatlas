import { getUaeArticleContent } from "@/lib/content/gulf-heritage/uae/article-content";
import { staticGulfHeritagePagesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/pages.repository";
import { createStaticCmsBase } from "@/lib/content/gulf-heritage/cms/repositories/static/cms-base";
import type { GulfHeritageArticlesRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";
import type { GulfHeritageArticleRecord } from "@/types/gulf-heritage-cms";
import type {
  GulfHeritageCategorySlug,
  GulfHeritageCountrySlug,
  GulfHeritagePageSlug,
} from "@/types/gulf-heritage";
import type { Locale } from "@/types/i18n";

async function toArticleRecord(
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
  pageSlug: GulfHeritagePageSlug,
  locale: Locale,
): Promise<GulfHeritageArticleRecord | null> {
  const route = await staticGulfHeritagePagesRepository.getRoute(countrySlug, categorySlug, pageSlug);
  if (!route || route.kind !== "article") return null;

  const content = getUaeArticleContent(pageSlug, locale);
  if (!content) return null;

  return {
    ...createStaticCmsBase("article", `${countrySlug}:${categorySlug}:${pageSlug}`, locale),
    countrySlug,
    categorySlug,
    editorialStatus: route.editorialStatus,
    title: null,
    intro: content.intro,
    seoTitle: null,
    seoDescription: null,
    relatedPageSlugs: route.relatedPageSlugs,
    relatedRecipeSlugs: route.relatedRecipeSlugs,
    content,
  };
}

export const staticGulfHeritageArticlesRepository: GulfHeritageArticlesRepository = {
  async getBySlug(countrySlug, categorySlug, pageSlug, locale) {
    return toArticleRecord(countrySlug, categorySlug, pageSlug, locale);
  },

  async listByCategory(countrySlug, categorySlug, locale) {
    const routes = await staticGulfHeritagePagesRepository.listByCategory(countrySlug, categorySlug);
    const articles = await Promise.all(
      routes
        .filter((route) => route.kind === "article")
        .map((route) => toArticleRecord(countrySlug, categorySlug, route.slug, locale)),
    );
    return articles.filter((record): record is GulfHeritageArticleRecord => record !== null);
  },
};
