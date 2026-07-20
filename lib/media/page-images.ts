/** Licensed editorial paths for standalone pages and empty states. */
export const PAGE_EDITORIAL_IMAGES = {
  authLogin: "/images/hero/home-hero.webp",
  authSignup: "/images/recipes/espresso-shot.webp",
  authRecovery: "/images/recipes/coffee-beans-macro.webp",
  premium: "/images/hero/home-hero.webp",
  community: "/images/methods/siphon.webp",
  search: "/images/recipes/coffee-beans-macro.webp",
  notFound: "/images/recipes/espresso-shot.webp",
  offline: "/images/recipes/coffee-beans-macro.webp",
  emptyRecipes: "/images/methods/pour-over.webp",
  emptyFavorites: "/images/recipes/espresso-shot.webp",
  emptyGulfHeritage: "/images/culture/uae-coffee-culture-hero.webp",
  about: "/images/methods/pour-over.webp",
  contact: "/images/recipes/espresso-tonic.webp",
  aiCoach: "/images/culture/tea-hero.webp",
} as const;

export const GULF_HERITAGE_COUNTRY_HEROES = {
  "united-arab-emirates": "/images/culture/majlis-gathering.webp",
  "saudi-arabia": "/images/gulf-heritage/countries/saudi-arabia.webp",
  oman: "/images/gulf-heritage/countries/oman.webp",
  kuwait: "/images/gulf-heritage/countries/kuwait.webp",
  qatar: "/images/gulf-heritage/countries/qatar.webp",
  bahrain: "/images/gulf-heritage/countries/bahrain.webp",
} as const;

/** Map origin country names to editorial hero images. */
export const ORIGIN_COUNTRY_IMAGES: Record<string, string> = {
  Ethiopia: "/images/origins/ethiopia.webp",
  Colombia: "/images/origins/colombia.webp",
  Kenya: "/images/origins/kenya.webp",
  Guatemala: "/images/origins/guatemala.webp",
  Panama: "/images/origins/panama.webp",
  Indonesia: "/images/origins/indonesia.webp",
};

/** Infer device thumbnail from name when DB has no image. */
export function resolveDeviceImage(name: string): string {
  const value = name.toLowerCase();
  if (value.includes("v60") || value.includes("pour-over") || value.includes("pour over")) {
    return "/images/methods/pour-over.webp";
  }
  if (value.includes("french press")) return "/images/methods/french-press.webp";
  if (value.includes("siphon") || value.includes("vacuum")) return "/images/methods/siphon.webp";
  if (value.includes("aeropress")) return "/images/recipes/costa-rica-aeropress.webp";
  if (value.includes("espresso")) return "/images/recipes/espresso-shot.webp";
  if (value.includes("cold brew") || value.includes("cold-brew")) return "/images/recipes/cold-brew.webp";
  if (value.includes("chemex")) return "/images/recipes/chemex.webp";
  if (value.includes("moka")) return "/images/recipes/moka-pot-classic.webp";
  if (value.includes("french")) return "/images/methods/french-press.webp";
  return "/images/recipes/coffee-beans-macro.webp";
}

export function resolveOriginImage(country: string): string {
  return ORIGIN_COUNTRY_IMAGES[country] ?? "/images/origins/colombia.webp";
}
