/**
 * Deterministic coffee-card image priority for Gulf / directory recipes.
 * Prefer coffee-specific product media; never invent images.
 */

const GENERIC_METHOD_IMAGE_PREFIX = "/images/methods/";
const FALLBACK_IMAGE = "/images/methods/pour-over.webp";

export function isGenericMethodImage(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.startsWith(GENERIC_METHOD_IMAGE_PREFIX);
}

/**
 * 1) Coffee/product-specific image
 * 2) Recipe cover when it is not a generic method placeholder
 * 3) Existing BrewAtlas method/fallback image (not roaster logo)
 */
export function resolveRecipeCardImage(input: {
  productImageUrl?: string | null;
  recipeImageUrl?: string | null;
  fallbackImageUrl?: string | null;
}): string {
  const product = input.productImageUrl?.trim();
  if (product) return product;

  const recipe = input.recipeImageUrl?.trim();
  if (recipe && !isGenericMethodImage(recipe)) return recipe;

  const fallback = input.fallbackImageUrl?.trim();
  if (fallback) return fallback;

  return FALLBACK_IMAGE;
}
