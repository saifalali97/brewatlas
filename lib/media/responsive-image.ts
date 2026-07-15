import { DEFAULT_BLUR_DATA_URL } from "@/lib/media/blur-placeholder";
import { RECIPE_IMAGE_PLACEHOLDER } from "@/types/recipe";

export const IMAGE_SIZE_PRESETS = {
  recipeCard: "(min-width: 1024px) 33vw, 50vw",
  recipeCardFeatured: "(min-width: 1024px) 66vw, 100vw",
  recipeDetailCover: "(min-width: 1024px) 50vw, 100vw",
  recipeGallery: "(min-width: 1024px) 33vw, 50vw",
  hero: "(min-width: 1024px) 44vw, 100vw",
  card: "(min-width: 1024px) 25vw, 50vw",
  avatar: "48px",
  cmsThumb: "(max-width: 640px) 50vw, 25vw",
  cmsPicker: "120px",
  fullWidth: "100vw",
} as const;

export type ImageDeliveryMeta = {
  width?: number | null;
  height?: number | null;
  blurDataUrl?: string | null;
  alt?: string | null;
};

export function isSvgImageSrc(src: string): boolean {
  return src.endsWith(".svg") || src.includes(".svg?") || src === RECIPE_IMAGE_PLACEHOLDER;
}

export function shouldUnoptimizeImage(src: string): boolean {
  return isSvgImageSrc(src) || src.startsWith("blob:");
}

export function resolveBlurDataUrl(src: string, blurDataUrl?: string | null): string | undefined {
  if (shouldUnoptimizeImage(src)) return undefined;
  return blurDataUrl ?? DEFAULT_BLUR_DATA_URL;
}

export function resolveImageLoading(priority?: boolean, loading?: "lazy" | "eager"): "lazy" | "eager" | undefined {
  if (priority) return undefined;
  return loading ?? "lazy";
}
