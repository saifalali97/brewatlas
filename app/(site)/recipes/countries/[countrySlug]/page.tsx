import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GulfCountryCta } from "@/app/components/recipes/gulf-country-cta";
import { GulfCountryExplorer } from "@/app/components/recipes/gulf-country-explorer";
import { GulfCountryFeaturedRecipes } from "@/app/components/recipes/gulf-country-featured-recipes";
import { GulfCountryHero } from "@/app/components/recipes/gulf-country-hero";
import { GulfCountryStats } from "@/app/components/recipes/gulf-country-stats";
import {
  GULF_DIRECTORY_COUNTRIES,
  findGulfCountryBySlug,
  gulfCountryPath,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import { getGulfCountryPageData } from "@/lib/gulf-directory/country-page-data";
import { getGulfCountryCopy } from "@/lib/gulf-directory/localize";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import type { Difficulty } from "@/types/homepage";

type CountryPageProps = {
  params: Promise<{ countrySlug: string }>;
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
  return GULF_DIRECTORY_COUNTRIES.map((country) => ({
    countrySlug: country.slug,
  }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { countrySlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) {
    return { title: "Country not found" };
  }

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const countryName =
    dictionary.recipesDirectory.countries[
      countrySlug as keyof typeof dictionary.recipesDirectory.countries
    ]?.name ?? country.dbCountry;

  return buildLocalizedMetadata({
    pathname: `/recipes/countries/${countrySlug}`,
    locale,
    title: interpolate(dictionary.recipesDirectory.countryMetaTitleTemplate, {
      country: countryName,
    }),
    description: interpolate(dictionary.recipesDirectory.countryMetaDescriptionTemplate, {
      country: countryName,
    }),
  });
}

export default async function GulfCountryPage({ params }: CountryPageProps) {
  const { countrySlug } = await params;
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) notFound();

  const slug = country.slug as GulfDirectoryCountrySlug;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const copy = dictionary.recipesDirectory;
  const pageCopy = copy.countryPage;
  const countryCopy = getGulfCountryCopy(dictionary, slug);
  const pageData = getGulfCountryPageData(slug);

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
    pageData.brewMethods.map((method) => [method, labelForBrewMethod(method)]),
  );

  const featuredBrewMethodLabels = Object.fromEntries(
    pageData.featuredRecipes.map((recipe) => [
      recipe.brewMethod,
      labelForBrewMethod(recipe.brewMethod),
    ]),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl(`/recipes/countries/${countrySlug}`, locale),
              name: countryCopy.name,
              description: countryCopy.description,
              itemCount: pageData.totalRoasters,
            }),
          ),
        }}
      />

      <div className="min-h-screen bg-[#FDFCF8] pb-16">
        <GulfCountryHero
          flag={pageData.flag}
          name={countryCopy.name}
          description={countryCopy.description}
          coverImage={pageData.coverImage}
          imageAlt={interpolate(pageCopy.coverImageAltTemplate, { country: countryCopy.name })}
          backHref="/recipes"
          backLabel={copy.backToCountries}
        />

        <div className="mt-8 space-y-14 sm:mt-10 sm:space-y-16">
          <GulfCountryStats
            totalRoasters={pageData.totalRoasters}
            totalRecipes={pageData.totalRecipes}
            citiesCovered={pageData.citiesCovered}
            totalRoastersLabel={pageCopy.totalRoastersLabel}
            totalRecipesLabel={pageCopy.totalRecipesLabel}
            citiesCoveredLabel={pageCopy.citiesCoveredLabel}
          />

          <GulfCountryExplorer
            countrySlug={slug}
            roasters={pageData.roasters}
            cities={pageData.cities}
            brewMethods={pageData.brewMethods}
            difficulties={pageData.difficulties}
            labels={{
              sectionTitle: pageCopy.roastersSectionTitle,
              filtersAriaLabel: pageCopy.filtersAriaLabel,
              filterCity: pageCopy.filterCity,
              filterBrewMethod: pageCopy.filterBrewMethod,
              filterRoaster: pageCopy.filterRoaster,
              filterDifficulty: pageCopy.filterDifficulty,
              filterAny: pageCopy.filterAny,
              specialtyLabel: pageCopy.specialtyLabel,
              exploreLabel: pageCopy.exploreRoasterLabel,
              recipeCountTemplate: copy.recipeCountTemplate,
              noMatchingRoasters: pageCopy.noMatchingRoasters,
              noRoastersInCountry: copy.noRoastersInCountry,
              difficultyLabels,
              brewMethodLabels,
            }}
          />

          <GulfCountryFeaturedRecipes
            title={pageCopy.featuredRecipesTitle}
            description={pageCopy.featuredRecipesDescription}
            recipes={pageData.featuredRecipes}
            hotLabel={copy.hotBadge}
            icedLabel={copy.icedBadge}
            difficultyLabels={difficultyLabels}
            brewMethodLabels={featuredBrewMethodLabels}
            imageAltTemplate={pageCopy.featuredRecipeImageAltTemplate}
          />

          <GulfCountryCta
            title={interpolate(pageCopy.bottomCtaTitleTemplate, { country: countryCopy.name })}
            description={interpolate(pageCopy.bottomCtaDescriptionTemplate, {
              country: countryCopy.name,
            })}
            buttonLabel={interpolate(pageCopy.bottomCtaButtonTemplate, {
              country: countryCopy.name,
            })}
            href={`${gulfCountryPath(slug)}#gulf-country-roasters-heading`}
          />
        </div>
      </div>
    </>
  );
}
