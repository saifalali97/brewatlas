export const MEDIA_LIBRARY_BUCKET = "media-library";
export const MEDIA_PAGE_SIZE = 24;
export const MEDIA_MAX_BYTES = 12 * 1024 * 1024;

export const MEDIA_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const MEDIA_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"] as const;

export const ALLOWED_RECIPE_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
]);

export const RECIPE_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

export const MEDIA_VARIANT_WIDTHS = {
  thumbnail: 160,
  sm: 480,
  md: 960,
  lg: 1600,
} as const;

export type MediaVariantKey = keyof typeof MEDIA_VARIANT_WIDTHS | "original";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
