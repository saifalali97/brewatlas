import type { Metadata } from "next";
import { SearchExplorer } from "@/app/components/search/search-explorer";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { featuredRecipes as staticRecipesEn } from "@/data/homepage";
import { getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { getRecipeSlug } from "@/lib/data/recipes";
import { getSearchFilterOptions, runGlobalSearch } from "@/lib/data/search";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";
import { countActiveFilters, parseSearchParams } from "@/lib/search/params";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { getSiteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";
import type { Dictionary } from "@/lib/i18n/types";
import type { DeviceSearchHit, SearchFilters } from "@/types/search";
import type { RecipeListItem } from "@/types/recipe";

function buildSearchTitle(dictionary: Dictionary, filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.q) parts.push(filters.q);
  if (filters.category !== "all") {
    const categoryLabels: Record<SearchFilters["category"], string> = {
      all: "",
      recipes: dictionary.searchPage.categoryRecipes,
      roasters: dictionary.searchPage.categoryRoasters,
      origins: dictionary.searchPage.categoryOrigins,
      devices: dictionary.searchPage.categoryDevices,
      varieties: dictionary.searchPage.categoryVarieties,
      flavors: dictionary.searchPage.categoryFlavors,
    };
    const label = categoryLabels[filters.category];
    if (label) parts.push(label);
  }
  if (countActiveFilters(filters) > 0) parts.push(dictionary.searchPage.filtersTitle);

  if (parts.length === 0) return dictionary.metadata.searchTitle;
  return `${dictionary.searchPage.title}: ${parts.join(" · ")}`;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const params = await searchParams;
  const filters = parseSearchParams(params);

  const title = buildSearchTitle(dictionary, filters);

  return buildLocalizedMetadata({
    pathname: "/search",
    locale,
    title,
    description: dictionary.metadata.searchDescription,
  });
}

const deviceNameKeys: (keyof Dictionary["devicesPage"])[] = [
  "deviceNamePourOver",
  "deviceNameEspresso",
  "deviceNameFrenchPress",
  "deviceNameAeropress",
  "deviceNameColdBrew",
  "deviceNameSiphon",
];

function buildSearchJsonLd(query: string, resultCount: number) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SearchResultsPage",
    url: `${siteUrl}/search${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    name: "BrewAtlas Search",
    description: "Search results for specialty coffee recipes, roasters, origins, and brewing devices.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: resultCount,
    },
  };
}

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const filters = parseSearchParams(params);
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  const staticRecipes: RecipeListItem[] = content.featuredRecipes.map((recipe, index) => ({
    ...recipe,
    slug: getRecipeSlug(staticRecipesEn[index]),
    source: "static",
  }));

  const staticDevices: DeviceSearchHit[] = content.brewMethods.map((method, index) => {
    const deviceNameKey = deviceNameKeys[index];
    const deviceName = deviceNameKey ? dictionary.devicesPage[deviceNameKey] : method.name;
    return {
      id: `static-${index}`,
      name: deviceName,
      slug: null,
      manufacturer: null,
      source: "static",
      image: method.image,
      description: method.description,
    };
  });

  const [filterOptions, results, favoritedRecipeIds] = await Promise.all([
    getSearchFilterOptions(supabase),
    runGlobalSearch({
      supabase,
      filters,
      staticRecipes,
      staticRoasters: content.topRoasters,
      staticOrigins: content.coffeeOrigins,
      staticDevices,
    }),
    authData.user ? getUserFavoriteRecipeIds(supabase, authData.user.id) : Promise.resolve(new Set<string>()),
  ]);

  const totalResultCount =
    results.totalRecipes +
    results.roasters.length +
    results.origins.length +
    results.devices.length +
    results.varieties.length +
    results.flavors.length;

  return (
    <SectionFrame id="search" ariaLabelledBy="search-heading" padding="compact">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSearchJsonLd(filters.q, totalResultCount)) }}
      />
      <PageHeader
        eyebrow={dictionary.searchPage.eyebrow}
        title={dictionary.searchPage.title}
        description={dictionary.searchPage.description}
      />
      <SearchExplorer
        initialFilters={filters}
        filterOptions={filterOptions}
        results={results}
        favoritedRecipeIds={Array.from(favoritedRecipeIds)}
        isAuthenticated={Boolean(authData.user)}
      />
    </SectionFrame>
  );
}
