import { optionalNumber, optionalString } from "@/lib/forms/form-fields";
import type { ImageDeliveryMeta } from "@/lib/media/responsive-image";

export type StoredImageMetadata = ImageDeliveryMeta;

export function parseCoverImageMetadata(formData: FormData): StoredImageMetadata {
  return {
    width: optionalNumber(formData, "coverImageWidth"),
    height: optionalNumber(formData, "coverImageHeight"),
    blurDataUrl: optionalString(formData, "coverImageBlur"),
    alt: optionalString(formData, "coverImageAlt"),
  };
}

export type GalleryImageMetadata = StoredImageMetadata;

export function parseGalleryImageMetadata(formData: FormData): GalleryImageMetadata[] {
  const raw = optionalString(formData, "galleryImageMeta");
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      width: typeof entry?.width === "number" ? entry.width : null,
      height: typeof entry?.height === "number" ? entry.height : null,
      blurDataUrl: typeof entry?.blurDataUrl === "string" ? entry.blurDataUrl : null,
      alt: typeof entry?.alt === "string" ? entry.alt : null,
    }));
  } catch {
    return [];
  }
}

export function metadataFromMediaAsset(asset: {
  width: number | null;
  height: number | null;
  altText: string | null;
  blurDataUrl?: string | null;
}): StoredImageMetadata {
  return {
    width: asset.width,
    height: asset.height,
    blurDataUrl: asset.blurDataUrl ?? null,
    alt: asset.altText,
  };
}

export function coverImageColumns(meta: StoredImageMetadata) {
  return {
    cover_image_width: meta.width ?? null,
    cover_image_height: meta.height ?? null,
    cover_image_alt: meta.alt ?? null,
    cover_image_blur: meta.blurDataUrl ?? null,
  };
}
