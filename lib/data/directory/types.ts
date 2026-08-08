import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";

/** Row shape for public.countries. */
export type CountryRow = {
  id: string;
  slug: string;
  name: string;
  flag: string;
  sort_order: number;
  published: boolean;
};

/** Row shape for public.cities. */
export type CityRow = {
  id: string;
  country_id: string;
  name: string;
  slug: string;
  published: boolean;
};

/** Row shape for directory-relevant roaster columns. */
export type DirectoryRoasterRow = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  country_id: string | null;
  emirate: string | null;
  city: string | null;
  city_id: string | null;
  website: string | null;
  instagram: string | null;
  logo_url: string | null;
  banner_image_url: string | null;
  description: string | null;
  featured: boolean;
  is_uae: boolean;
  verified: boolean;
  published: boolean;
};

export type DirectoryCountry = {
  id: string | null;
  slug: GulfDirectoryCountrySlug;
  name: string;
  flag: string;
  sortOrder: number;
};

export type DirectoryCity = {
  id: string | null;
  countryId: string | null;
  countrySlug: GulfDirectoryCountrySlug;
  name: string;
  slug: string;
};

export type DirectoryRoaster = {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  countryId: string | null;
  countrySlug: GulfDirectoryCountrySlug | null;
  emirate: string | null;
  city: string | null;
  cityId: string | null;
  website: string | null;
  instagram: string | null;
  logoUrl: string | null;
  bannerImageUrl: string | null;
  description: string | null;
  featured: boolean;
  verified: boolean;
  recipeCount: number;
};

export const DIRECTORY_ROASTER_FIELDS =
  "id, name, slug, country, country_id, emirate, city, city_id, website, instagram, logo_url, banner_image_url, description, featured, is_uae, verified, published" as const;

export const DIRECTORY_COUNTRY_FIELDS =
  "id, slug, name, flag, sort_order, published" as const;

export const DIRECTORY_CITY_FIELDS =
  "id, country_id, name, slug, published" as const;
