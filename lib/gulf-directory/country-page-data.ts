import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import {
  findGulfCountryBySlug,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import type { Difficulty } from "@/types/homepage";

/** Placeholder roaster card for Gulf country pages (replace with Supabase later). */
export type GulfCountryPageRoaster = {
  id: string;
  name: string;
  slug: string;
  city: string;
  logoUrl: string | null;
  recipeCount: number;
  specialty: string;
  brewMethods: string[];
  difficulties: Difficulty[];
};

/** Placeholder featured recipe for Gulf country pages. */
export type GulfCountryPageRecipe = {
  id: string;
  slug: string;
  name: string;
  brewMethod: string;
  difficulty: Difficulty;
  image: string;
  roasterName: string;
  roasterSlug: string;
  countrySlug: GulfDirectoryCountrySlug;
  isIced: boolean;
};

export type GulfCountryPageData = {
  slug: GulfDirectoryCountrySlug;
  flag: string;
  dbCountry: string;
  coverImage: string;
  totalRoasters: number;
  totalRecipes: number;
  citiesCovered: number;
  cities: string[];
  brewMethods: string[];
  difficulties: Difficulty[];
  roasters: GulfCountryPageRoaster[];
  featuredRecipes: GulfCountryPageRecipe[];
};

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

/** Placeholder country page payload — swap for Supabase loaders later. */
export function getGulfCountryPageData(slug: GulfDirectoryCountrySlug): GulfCountryPageData {
  if (slug === "uae") {
    return buildUaePageData();
  }
  return emptyCountryPage(slug);
}

export function findGulfCountryPageRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRoaster | null {
  return (
    getGulfCountryPageData(countrySlug).roasters.find((roaster) => roaster.slug === roasterSlug) ??
    null
  );
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
    const match = getGulfCountryPageData(country).featuredRecipes.find(
      (recipe) => recipe.slug === recipeSlug,
    );
    if (match) return match;
  }
  return null;
}

export function findGulfCountrySlugForRoaster(
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
    if (findGulfCountryPageRoaster(country, roasterSlug)) {
      return country;
    }
  }
  return null;
}

export function getGulfCountryPageRecipesForRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRecipe[] {
  return getGulfCountryPageData(countrySlug).featuredRecipes.filter(
    (recipe) => recipe.roasterSlug === roasterSlug,
  );
}
