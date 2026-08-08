import { getCachedSupabaseGulfCountryPageData } from "@/lib/data/cached-directory";
import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import {
  findGulfCountryBySlug,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import type {
  GulfCountryPageData,
  GulfCountryPageRecipe,
  GulfCountryPageRoaster,
} from "@/lib/gulf-directory/country-page-types";
import type { Difficulty } from "@/types/homepage";

export type {
  GulfCountryPageData,
  GulfCountryPageRecipe,
  GulfCountryPageRoaster,
} from "@/lib/gulf-directory/country-page-types";

const UAE_ROASTERS: GulfCountryPageRoaster[] = [
  {
    id: "uae-raw",
    name: "RAW Coffee Company",
    slug: "raw-coffee-company",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/raw-coffee-company.webp",
    recipeCount: 14,
    specialty: "Single origin & SCA training",
    brewMethods: ["V60", "Espresso", "Cold Brew"],
    difficulties: ["Beginner", "Intermediate", "Advanced"],
  },
  {
    id: "uae-espresso-lab",
    name: "The Espresso Lab",
    slug: "the-espresso-lab",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/the-espresso-lab.webp",
    recipeCount: 11,
    specialty: "Competition espresso & milk drinks",
    brewMethods: ["Espresso", "Aeropress"],
    difficulties: ["Intermediate", "Advanced"],
  },
  {
    id: "uae-seven-fortunes",
    name: "Seven Fortunes",
    slug: "seven-fortunes",
    city: "Abu Dhabi",
    logoUrl: "/images/gulf-heritage/seven-fortunes.webp",
    recipeCount: 9,
    specialty: "Light-roast filter profiles",
    brewMethods: ["V60", "Chemex", "Aeropress"],
    difficulties: ["Beginner", "Intermediate"],
  },
  {
    id: "uae-cypher",
    name: "Cypher Roastery",
    slug: "cypher-roastery",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/cypher-roastery.webp",
    recipeCount: 8,
    specialty: "Experimental process lots",
    brewMethods: ["V60", "Cold Brew"],
    difficulties: ["Intermediate", "Advanced"],
  },
  {
    id: "uae-boom",
    name: "Boom Coffee",
    slug: "boom-coffee",
    city: "Sharjah",
    logoUrl: "/images/gulf-heritage/boom-coffee.webp",
    recipeCount: 7,
    specialty: "Everyday specialty & cold brew",
    brewMethods: ["Espresso", "Cold Brew", "Moka Pot"],
    difficulties: ["Beginner", "Intermediate"],
  },
  {
    id: "uae-gold-box",
    name: "Gold Box Roastery",
    slug: "gold-box-roastery",
    city: "Dubai",
    logoUrl: "/images/gulf-heritage/gold-box-roastery.webp",
    recipeCount: 6,
    specialty: "Boutique seasonal microlots",
    brewMethods: ["V60", "Chemex"],
    difficulties: ["Intermediate", "Advanced"],
  },
  {
    id: "uae-nightjar",
    name: "Nightjar Coffee",
    slug: "nightjar-coffee",
    city: "Abu Dhabi",
    logoUrl: "/images/gulf-heritage/nightjar-coffee.webp",
    recipeCount: 5,
    specialty: "Precision filter & espresso",
    brewMethods: ["V60", "Espresso", "Aeropress"],
    difficulties: ["Beginner", "Intermediate", "Advanced"],
  },
];

const UAE_FEATURED_RECIPES: GulfCountryPageRecipe[] = [
  {
    id: "uae-recipe-1",
    slug: "raw-v60-ethiopian",
    name: "RAW Ethiopian V60",
    brewMethod: "V60",
    difficulty: "Intermediate",
    image: "/images/methods/pour-over.webp",
    roasterName: "RAW Coffee Company",
    roasterSlug: "raw-coffee-company",
    countrySlug: "uae",
    isIced: false,
  },
  {
    id: "uae-recipe-2",
    slug: "espresso-lab-signature",
    name: "Espresso Lab Signature",
    brewMethod: "Espresso",
    difficulty: "Advanced",
    image: "/images/recipes/espresso-shot.webp",
    roasterName: "The Espresso Lab",
    roasterSlug: "the-espresso-lab",
    countrySlug: "uae",
    isIced: false,
  },
  {
    id: "uae-recipe-3",
    slug: "cypher-cold-brew",
    name: "Cypher Cold Brew",
    brewMethod: "Cold Brew",
    difficulty: "Beginner",
    image: "/images/recipes/cold-brew.webp",
    roasterName: "Cypher Roastery",
    roasterSlug: "cypher-roastery",
    countrySlug: "uae",
    isIced: true,
  },
];

function emptyCountryPage(slug: GulfDirectoryCountrySlug): GulfCountryPageData {
  const country = findGulfCountryBySlug(slug)!;
  return {
    slug,
    flag: country.flag,
    dbCountry: country.dbCountry,
    coverImage: resolveGulfCountryBanner(slug),
    totalRoasters: 0,
    totalRecipes: 0,
    citiesCovered: 0,
    cities: [],
    brewMethods: [],
    difficulties: ["Beginner", "Intermediate", "Advanced"],
    roasters: [],
    featuredRecipes: [],
  };
}

function buildUaePageData(): GulfCountryPageData {
  const cities = [...new Set(UAE_ROASTERS.map((roaster) => roaster.city))].sort();
  const brewMethods = [
    ...new Set(UAE_ROASTERS.flatMap((roaster) => roaster.brewMethods)),
  ].sort();
  const difficulties = [
    ...new Set(UAE_ROASTERS.flatMap((roaster) => roaster.difficulties)),
  ] as Difficulty[];

  return {
    slug: "uae",
    flag: "🇦🇪",
    dbCountry: "United Arab Emirates",
    coverImage: resolveGulfCountryBanner("uae"),
    totalRoasters: UAE_ROASTERS.length,
    totalRecipes: UAE_ROASTERS.reduce((sum, roaster) => sum + roaster.recipeCount, 0),
    citiesCovered: cities.length,
    cities,
    brewMethods,
    difficulties,
    roasters: UAE_ROASTERS,
    featuredRecipes: UAE_FEATURED_RECIPES,
  };
}

/** Sync placeholder payload — used only when Supabase has no roasters for the country. */
export function getPlaceholderGulfCountryPageData(
  slug: GulfDirectoryCountrySlug,
): GulfCountryPageData {
  if (slug === "uae") {
    return buildUaePageData();
  }
  return emptyCountryPage(slug);
}

/**
 * Country page payload: live Supabase data when roasters exist,
 * otherwise identical placeholder/empty shells.
 */
export async function getGulfCountryPageData(
  slug: GulfDirectoryCountrySlug,
): Promise<GulfCountryPageData> {
  const live = await getCachedSupabaseGulfCountryPageData(slug);
  if (live) return live;
  return getPlaceholderGulfCountryPageData(slug);
}

export function findPlaceholderGulfCountryPageRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRoaster | null {
  return (
    getPlaceholderGulfCountryPageData(countrySlug).roasters.find(
      (roaster) => roaster.slug === roasterSlug,
    ) ?? null
  );
}

/** @deprecated Prefer async country page loader + directory roaster queries. */
export function findGulfCountryPageRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRoaster | null {
  return findPlaceholderGulfCountryPageRoaster(countrySlug, roasterSlug);
}

export function findGulfCountryPageRecipe(recipeSlug: string): GulfCountryPageRecipe | null {
  for (const country of [
    "uae",
    "saudi-arabia",
    "kuwait",
    "qatar",
    "bahrain",
    "oman",
  ] as const) {
    const match = getPlaceholderGulfCountryPageData(country).featuredRecipes.find(
      (recipe) => recipe.slug === recipeSlug,
    );
    if (match) return match;
  }
  return null;
}

export function findPlaceholderGulfCountrySlugForRoaster(
  roasterSlug: string,
): GulfDirectoryCountrySlug | null {
  for (const country of [
    "uae",
    "saudi-arabia",
    "kuwait",
    "qatar",
    "bahrain",
    "oman",
  ] as const) {
    if (findPlaceholderGulfCountryPageRoaster(country, roasterSlug)) {
      return country;
    }
  }
  return null;
}

/** @deprecated Prefer directory roaster countrySlug. */
export function findGulfCountrySlugForRoaster(
  roasterSlug: string,
): GulfDirectoryCountrySlug | null {
  return findPlaceholderGulfCountrySlugForRoaster(roasterSlug);
}

export function getGulfCountryPageRecipesForRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRecipe[] {
  return getPlaceholderGulfCountryPageData(countrySlug).featuredRecipes.filter(
    (recipe) => recipe.roasterSlug === roasterSlug,
  );
}
