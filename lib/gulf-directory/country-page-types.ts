import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { Difficulty } from "@/types/homepage";

/** Roaster card model for Gulf country pages. */
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

/** Featured recipe model for Gulf country pages. */
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
