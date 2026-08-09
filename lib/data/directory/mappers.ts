import {
  findGulfCountryByDbCountry,
  findGulfCountryBySlug,
  GULF_DIRECTORY_COUNTRIES,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import { resolveDirectoryRoasterLogo } from "@/lib/data/directory/logo-fallbacks";
import type {
  CityRow,
  CountryRow,
  DirectoryCity,
  DirectoryCountry,
  DirectoryRoaster,
  DirectoryRoasterRow,
} from "@/lib/data/directory/types";

export function slugifyCityName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function specialtyFromDescription(description: string | null): string {
  if (!description?.trim()) return "Specialty coffee";
  const first = description.split(/[.!?]/)[0]?.trim() ?? "";
  if (!first) return "Specialty coffee";
  return first.length > 72 ? `${first.slice(0, 69)}…` : first;
}

export function mapCountryRow(row: CountryRow): DirectoryCountry | null {
  const known = findGulfCountryBySlug(row.slug);
  if (!known) return null;
  return {
    id: row.id,
    slug: known.slug,
    name: row.name,
    flag: row.flag || known.flag,
    sortOrder: row.sort_order,
  };
}

export function staticDirectoryCountries(): DirectoryCountry[] {
  return GULF_DIRECTORY_COUNTRIES.map((country, index) => ({
    id: null,
    slug: country.slug,
    name: country.dbCountry,
    flag: country.flag,
    sortOrder: index + 1,
  }));
}

export function mapCityRow(
  row: CityRow,
  countrySlug: GulfDirectoryCountrySlug,
): DirectoryCity {
  return {
    id: row.id,
    countryId: row.country_id,
    countrySlug,
    name: row.name,
    slug: row.slug,
  };
}

export function mapDirectoryRoaster(
  row: DirectoryRoasterRow,
  recipeCount = 0,
): DirectoryRoaster | null {
  if (!row.slug) return null;

  const countrySlug = row.country
    ? (findGulfCountryByDbCountry(row.country)?.slug ?? null)
    : null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    country: row.country,
    countryId: row.country_id,
    countrySlug,
    emirate: row.emirate,
    city: row.city,
    cityId: row.city_id,
    website: row.website,
    instagram: row.instagram,
    logoUrl: resolveDirectoryRoasterLogo(row.slug, row.logo_url),
    bannerImageUrl: row.banner_image_url,
    description: row.description,
    specialty: row.specialty?.trim() || null,
    foundedYear: row.founded_year,
    featured: row.featured,
    verified: row.verified,
    recipeCount,
  };
}
