import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";

/** Editorial banner photography for Gulf directory country cards. */
export const GULF_COUNTRY_BANNER_IMAGES: Record<GulfDirectoryCountrySlug, string> = {
  uae: "/images/hero/home-hero.webp",
  "saudi-arabia": "/images/gulf-heritage/countries/saudi-arabia.webp",
  kuwait: "/images/gulf-heritage/countries/kuwait.webp",
  qatar: "/images/gulf-heritage/countries/qatar.webp",
  bahrain: "/images/gulf-heritage/countries/bahrain.webp",
  oman: "/images/gulf-heritage/countries/oman.webp",
};

export function resolveGulfCountryBanner(slug: GulfDirectoryCountrySlug): string {
  return GULF_COUNTRY_BANNER_IMAGES[slug] ?? "/images/fallback/coffee-placeholder.webp";
}
