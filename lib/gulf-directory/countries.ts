/** GCC countries in the BrewAtlas Gulf Roasters Directory. */
export const GULF_DIRECTORY_COUNTRIES = [
  {
    slug: "uae",
    dbCountry: "United Arab Emirates",
    flag: "🇦🇪",
  },
  {
    slug: "saudi-arabia",
    dbCountry: "Saudi Arabia",
    flag: "🇸🇦",
  },
  {
    slug: "kuwait",
    dbCountry: "Kuwait",
    flag: "🇰🇼",
  },
  {
    slug: "qatar",
    dbCountry: "Qatar",
    flag: "🇶🇦",
  },
  {
    slug: "bahrain",
    dbCountry: "Bahrain",
    flag: "🇧🇭",
  },
  {
    slug: "oman",
    dbCountry: "Oman",
    flag: "🇴🇲",
  },
] as const;

export type GulfDirectoryCountrySlug = (typeof GULF_DIRECTORY_COUNTRIES)[number]["slug"];

export function gulfCountryPath(countrySlug: GulfDirectoryCountrySlug): string {
  return `/recipes/countries/${countrySlug}`;
}

export function gulfRoasterPath(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): string {
  return `/recipes/countries/${countrySlug}/roasters/${roasterSlug}`;
}

export function gulfRecipePath(recipeSlug: string): string {
  return `/recipes/${recipeSlug}`;
}

export function findGulfCountryBySlug(slug: string) {
  return GULF_DIRECTORY_COUNTRIES.find((country) => country.slug === slug) ?? null;
}

export function findGulfCountryByDbCountry(dbCountry: string) {
  return GULF_DIRECTORY_COUNTRIES.find((country) => country.dbCountry === dbCountry) ?? null;
}
