/** Local heritage logos used when Supabase `logo_url` is null. */
export const DIRECTORY_ROASTER_LOGO_FALLBACKS: Record<string, string> = {
  "raw-coffee-company": "/images/gulf-heritage/raw-coffee-company.webp",
  "the-espresso-lab": "/images/gulf-heritage/the-espresso-lab.webp",
  "seven-fortunes": "/images/gulf-heritage/seven-fortunes.webp",
  "cypher-roastery": "/images/gulf-heritage/cypher-roastery.webp",
  "boom-coffee": "/images/gulf-heritage/boom-coffee.webp",
  "gold-box-roastery": "/images/gulf-heritage/gold-box-roastery.webp",
  "nightjar-coffee": "/images/gulf-heritage/nightjar-coffee.webp",
};

export function resolveDirectoryRoasterLogo(
  slug: string | null | undefined,
  logoUrl: string | null | undefined,
): string | null {
  if (logoUrl) return logoUrl;
  if (!slug) return null;
  return DIRECTORY_ROASTER_LOGO_FALLBACKS[slug] ?? null;
}
