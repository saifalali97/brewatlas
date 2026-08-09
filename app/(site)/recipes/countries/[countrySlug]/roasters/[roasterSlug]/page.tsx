import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GulfRoasterAbout } from "@/app/components/recipes/gulf-roaster-about";
import { GulfRoasterFeaturedRecipe } from "@/app/components/recipes/gulf-roaster-featured-recipe";
import { GulfRoasterHero } from "@/app/components/recipes/gulf-roaster-hero";
import { GulfRoasterRecipes } from "@/app/components/recipes/gulf-roaster-recipes";
import { GulfRoasterRelated } from "@/app/components/recipes/gulf-roaster-related";
import { GulfRoasterStats } from "@/app/components/recipes/gulf-roaster-stats";
import { rdLayout, rdSurface } from "@/lib/design-system/recipes-directory";
import {
  findGulfCountryBySlug,
  gulfCountryPath,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import {
  getGulfRoasterPageData,
  listGulfRoasterPageParams,
} from "@/lib/gulf-directory/roaster-page-data";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import type { Difficulty } from "@/types/homepage";

type RoasteryPageProps = {
  params: Promise<{ countrySlug: string; roasterSlug: string }>;
};

const BREW_METHOD_LABELS: Record<
  string,
  "v60" | "espresso" | "chemex" | "aeropress" | "coldBrew" | "mokaPot"
> = {
  V60: "v60",
  Espresso: "espresso",
  Chemex: "chemex",
  Aeropress: "aeropress",
  "Cold Brew": "coldBrew",
  "Moka Pot": "mokaPot",
};

export function generateStaticParams() {
  return listGulfRoasterPageParams();
}

export async function generateMetadata({ params }: RoasteryPageProps): Promise<Metadata> {
  const { countrySlug, roasterSlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) {
    return { title: "Roastery not found" };
  }

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const pageData = await getGulfRoasterPageData(country.slug, roasterSlug);
  const roasterName = pageData?.name ?? roasterSlug;

  return buildLocalizedMetadata({
    pathname: `/recipes/countries/${countrySlug}/roasters/${roasterSlug}`,
    locale,
    title: interpolate(dictionary.recipesDirectory.roasteryMetaTitleTemplate, {
      roaster: roasterName,
    }),
    description:
      pageData?.about ??
      interpolate(dictionary.recipesDirectory.roasteryMetaDescriptionTemplate, {
        roaster: roasterName,
      }),
  });
}

export default async function GulfCountryRoasterPage({ params }: RoasteryPageProps) {
  const { countrySlug, roasterSlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) notFound();

  const slug = country.slug as GulfDirectoryCountrySlug;
  const pageData = await getGulfRoasterPageData(slug, roasterSlug);
  if (!pageData) notFound();

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const copy = dictionary.recipesDirectory;
  const pageCopy = copy.roasterPage;
  const countryName = copy.countries[slug]?.name ?? country.dbCountry;

  const difficultyLabels = {
    Beginner: dictionary.homeDifficulty.beginner,
    Intermediate: dictionary.homeDifficulty.intermediate,
    Advanced: dictionary.homeDifficulty.advanced,
  } satisfies Record<Difficulty, string>;

  const labelForBrewMethod = (method: string) => {
    const key = BREW_METHOD_LABELS[method];
    return key ? dictionary.homeFilters[key] : method;
  };

  const brewMethodLabels = Object.fromEntries(
    [...new Set(pageData.recipes.map((recipe) => recipe.brewMethod))].map((method) => [
      method,
      labelForBrewMethod(method),
    ]),
  );

  const featuredRecipe =
    pageData.featuredRecipeSlug != null
      ? (pageData.recipes.find((recipe) => recipe.slug === pageData.featuredRecipeSlug) ?? null)
      : null;

  const brewingStylesLabel =
    pageData.brewingStyles.length > 0
      ? pageData.brewingStyles.map(labelForBrewMethod).join(" · ")
      : "—";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl(
                `/recipes/countries/${countrySlug}/roasters/${roasterSlug}`,
                locale,
              ),
              name: pageData.name,
              description: pageData.about,
              itemCount: pageData.totalRecipes,
            }),
          ),
        }}
      />

      <div className={`min-h-screen ${rdSurface.page} pb-16`}>
        <GulfRoasterHero
          name={pageData.name}
          city={pageData.city}
          countryName={countryName}
          specialty={pageData.specialty}
          coverImage={pageData.coverImage}
          coverImageAlt={interpolate(pageCopy.coverImageAltTemplate, {
            roaster: pageData.name,
          })}
          logoUrl={pageData.logoUrl}
          website={pageData.website}
          instagram={pageData.instagram}
          websiteLabel={copy.websiteLabel}
          instagramLabel={copy.instagramLabel}
          specialtyLabel={copy.countryPage.specialtyLabel}
          backHref={gulfCountryPath(slug)}
          backLabel={interpolate(pageCopy.backToCountryTemplate, { country: countryName })}
        />

        <div className={rdLayout.sectionStack}>
          <GulfRoasterAbout title={pageCopy.aboutTitle} description={pageData.about} />

          <GulfRoasterStats
            ariaLabel={pageCopy.statsAriaLabel}
            totalRecipes={pageData.totalRecipes}
            foundedYear={pageData.foundedYear}
            locationLabel={pageData.locationLabel}
            brewingStylesLabel={brewingStylesLabel}
            totalRecipesLabel={pageCopy.totalRecipesLabel}
            foundedYearLabel={pageCopy.foundedYearLabel}
            locationStatLabel={pageCopy.locationStatLabel}
            brewingStylesStatLabel={pageCopy.brewingStylesStatLabel}
          />

          <GulfRoasterRecipes
            title={pageCopy.recipesTitle}
            description={pageCopy.recipesDescription}
            recipes={pageData.recipes}
            hotLabel={copy.hotBadge}
            icedLabel={copy.icedBadge}
            coffeeLabel={copy.coffeeLabel}
            brewTimeLabel={pageCopy.brewTimeLabel}
            ratingLabel={copy.ratingLabel}
            exploreLabel={pageCopy.exploreRecipeLabel}
            emptyLabel={copy.noRecipesForRoastery}
            difficultyLabels={difficultyLabels}
            brewMethodLabels={brewMethodLabels}
            imageAltTemplate={copy.countryPage.featuredRecipeImageAltTemplate}
          />

          {featuredRecipe ? (
            <GulfRoasterFeaturedRecipe
              title={pageCopy.featuredTitle}
              description={pageCopy.featuredDescription}
              recipe={featuredRecipe}
              hotLabel={copy.hotBadge}
              icedLabel={copy.icedBadge}
              exploreLabel={pageCopy.exploreRecipeLabel}
              brewMethodLabel={
                brewMethodLabels[featuredRecipe.brewMethod] ?? featuredRecipe.brewMethod
              }
              difficultyLabel={difficultyLabels[featuredRecipe.difficulty]}
              imageAltTemplate={copy.countryPage.featuredRecipeImageAltTemplate}
            />
          ) : null}

          <GulfRoasterRelated
            countrySlug={slug}
            title={pageCopy.relatedTitle}
            description={pageCopy.relatedDescription}
            roasters={pageData.relatedRoasters}
            specialtyLabel={copy.countryPage.specialtyLabel}
            exploreLabel={copy.countryPage.exploreRoasterLabel}
            recipeCountTemplate={(count) =>
              interpolate(copy.recipeCountTemplate, { count: String(count) })
            }
            emptyLabel={pageCopy.relatedEmpty}
          />
        </div>
      </div>
    </>
  );
}
