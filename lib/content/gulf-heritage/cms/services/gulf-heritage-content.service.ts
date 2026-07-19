import { localizeGulfHeritageRecipe } from "@/lib/content/gulf-heritage/localize";
import type { GulfHeritageCmsRepositories } from "@/lib/content/gulf-heritage/cms/repositories/types";
import { GULF_HERITAGE_COUNTRIES } from "@/lib/content/gulf-heritage/config";
import type {
  GulfHeritageBreadcrumb,
  GulfHeritageCategoryCopy,
  GulfHeritageCategorySlug,
  GulfHeritageCountryCopy,
  GulfHeritageCountrySlug,
  GulfHeritagePageCopy,
  GulfHeritagePageDefinition,
  GulfHeritagePageSlug,
  GulfHeritageResolvedPage,
} from "@/types/gulf-heritage";
import {
  GULF_HERITAGE_HUB_PATH,
  gulfHeritageCategoryPath,
  gulfHeritagePagePath,
} from "@/types/gulf-heritage";
import type { GulfHeritageArticleContent } from "@/types/gulf-heritage-article-content";
import { isRecipeVerified } from "@/types/gulf-heritage-recipe";
import { createEmptyGulfHeritagePageImages } from "@/types/gulf-heritage-images";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";
import { DEFAULT_LOCALE } from "@/types/i18n";

function mergePageCopy(recordCopy: Partial<GulfHeritagePageCopy>, dictionaryCopy: GulfHeritagePageCopy): GulfHeritagePageCopy {
  return {
    title: dictionaryCopy.title ?? recordCopy.title ?? "",
    intro: dictionaryCopy.intro ?? recordCopy.intro ?? null,
    seoTitle: dictionaryCopy.seoTitle ?? recordCopy.seoTitle ?? dictionaryCopy.seoTitle,
    seoDescription: dictionaryCopy.seoDescription ?? recordCopy.seoDescription ?? dictionaryCopy.seoDescription,
  };
}

function mergeCategoryCopy(
  recordCopy: Partial<GulfHeritageCategoryCopy>,
  dictionaryCopy: GulfHeritageCategoryCopy,
): GulfHeritageCategoryCopy {
  return {
    title: recordCopy.title ?? dictionaryCopy.title,
    description: recordCopy.description ?? dictionaryCopy.description,
    seoTitle: recordCopy.seoTitle ?? dictionaryCopy.seoTitle,
    seoDescription: recordCopy.seoDescription ?? dictionaryCopy.seoDescription,
  };
}

function mergeCountryCopy(
  recordCopy: Partial<GulfHeritageCountryCopy>,
  dictionaryCopy: GulfHeritageCountryCopy,
): GulfHeritageCountryCopy {
  return {
    name: recordCopy.name ?? dictionaryCopy.name,
    description: recordCopy.description ?? dictionaryCopy.description,
    seoTitle: recordCopy.seoTitle ?? dictionaryCopy.seoTitle,
    seoDescription: recordCopy.seoDescription ?? dictionaryCopy.seoDescription,
  };
}

function resolveArticleIntro(content: GulfHeritageArticleContent | null, locale: Locale): string | null {
  if (!content) return null;
  if (content.intro) return content.intro;
  // Do not promote English section bodies into the intro slot on Arabic pages.
  if (locale !== DEFAULT_LOCALE) return null;
  if (content.variant === "arabic-coffee") return content.sections.overview;
  return content.sections.history;
}

function buildBreadcrumbs(
  dictionary: Dictionary,
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
  pageSlug: GulfHeritagePageSlug,
  pageTitle: string,
): readonly GulfHeritageBreadcrumb[] {
  const gh = dictionary.gulfHeritagePage;

  return [
    { href: GULF_HERITAGE_HUB_PATH, label: gh.breadcrumbHub },
    { href: `/gulf-heritage/${countrySlug}`, label: gh.countries[countrySlug].name },
    {
      href: gulfHeritageCategoryPath(countrySlug, categorySlug),
      label: gh.categories[categorySlug].title,
    },
    { href: gulfHeritagePagePath(countrySlug, categorySlug, pageSlug), label: pageTitle },
  ];
}

export class GulfHeritageContentService {
  constructor(private readonly repositories: GulfHeritageCmsRepositories) {}

  async resolvePage(
    dictionary: Dictionary,
    countrySlug: string,
    categorySlug: string,
    pageSlug: string,
    locale: Locale = DEFAULT_LOCALE,
  ): Promise<GulfHeritageResolvedPage | null> {
    if (!this.isCountrySlug(countrySlug)) return null;

    const route = await this.repositories.pages.getRoute(
      countrySlug,
      categorySlug as GulfHeritageCategorySlug,
      pageSlug as GulfHeritagePageSlug,
    );
    if (!route) return null;

    const definition: GulfHeritagePageDefinition = {
      slug: route.slug,
      categorySlug: route.categorySlug,
      kind: route.kind,
      editorialStatus: route.editorialStatus,
      relatedPageSlugs: route.relatedPageSlugs,
      relatedRecipeSlugs: route.relatedRecipeSlugs,
    };

    const countryRecord = await this.repositories.countries.getBySlug(countrySlug, locale);
    const categoryRecord = await this.repositories.categories.getBySlug(
      countrySlug,
      route.categorySlug,
      locale,
    );

    const countryCopy = mergeCountryCopy(
      {
        name: countryRecord?.name ?? undefined,
        description: countryRecord?.description ?? undefined,
        seoTitle: countryRecord?.seoTitle ?? undefined,
        seoDescription: countryRecord?.seoDescription ?? undefined,
      },
      dictionary.gulfHeritagePage.countries[countrySlug],
    );

    const categoryCopy = mergeCategoryCopy(
      {
        title: categoryRecord?.title ?? undefined,
        description: categoryRecord?.description ?? undefined,
        seoTitle: categoryRecord?.seoTitle ?? undefined,
        seoDescription: categoryRecord?.seoDescription ?? undefined,
      },
      dictionary.gulfHeritagePage.categories[route.categorySlug],
    );

    const dictionaryPageCopy = dictionary.gulfHeritagePage.pages[route.slug];

    const [recipeRecords, referenceRecords, imageRecord, articleRecord, roasterRecord] = await Promise.all([
      this.repositories.recipes.listByPage(route.slug, locale),
      this.repositories.references.listByPage(route.slug, locale),
      this.repositories.images.getByPage(countrySlug, route.slug, locale),
      route.kind === "article"
        ? this.repositories.articles.getBySlug(countrySlug, route.categorySlug, route.slug, locale)
        : Promise.resolve(null),
      route.kind === "roaster"
        ? this.repositories.roasters.getBySlug(countrySlug, route.categorySlug, route.slug, locale)
        : Promise.resolve(null),
    ]);

    const articleIntro = resolveArticleIntro(articleRecord?.content ?? null, locale);
    const roasterIntro = roasterRecord?.intro ?? roasterRecord?.profile.history ?? roasterRecord?.profile.story ?? null;

    const copy = mergePageCopy(
      {
        title: articleRecord?.title ?? roasterRecord?.title ?? undefined,
        intro: articleRecord?.intro ?? articleIntro ?? roasterIntro ?? undefined,
        seoTitle: articleRecord?.seoTitle ?? roasterRecord?.seoTitle ?? undefined,
        seoDescription: articleRecord?.seoDescription ?? roasterRecord?.seoDescription ?? undefined,
      },
      dictionaryPageCopy,
    );

    const relatedPages = route.relatedPageSlugs.map((relatedSlug) => ({
      slug: relatedSlug,
      copy: dictionary.gulfHeritagePage.pages[relatedSlug],
      href: gulfHeritagePagePath(countrySlug, route.categorySlug, relatedSlug),
    }));

    const relatedRecipes = recipeRecords.map((record) =>
      localizeGulfHeritageRecipe(record.recipe, dictionary.gulfHeritagePage.recipeTitles),
    );
    const verifiedRecipes = relatedRecipes.filter(isRecipeVerified);

    const editorialStatus =
      articleRecord?.editorialStatus ?? roasterRecord?.editorialStatus ?? route.editorialStatus;

    return {
      countrySlug,
      categorySlug: route.categorySlug,
      definition,
      editorialStatus,
      copy,
      categoryCopy,
      countryCopy,
      breadcrumbs: buildBreadcrumbs(dictionary, countrySlug, route.categorySlug, route.slug, copy.title),
      relatedPages,
      relatedRecipes,
      verifiedRecipes,
      articleContent: articleRecord?.content ?? null,
      references: referenceRecords.map((record) => record.reference),
      images: imageRecord?.images ?? createEmptyGulfHeritagePageImages(),
      roasterFields: roasterRecord?.profile ?? null,
    };
  }

  private isCountrySlug(slug: string): slug is GulfHeritageCountrySlug {
    return GULF_HERITAGE_COUNTRIES.some((country) => country.slug === slug);
  }
}
