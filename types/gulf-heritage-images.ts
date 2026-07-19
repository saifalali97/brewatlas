/** Licensed image asset with editorial metadata — URL null until assets are cleared. */
export type GulfHeritageImageAsset = {
  url: string | null;
  caption: string | null;
  altText: string | null;
  credit: string | null;
  license: string | null;
  photographer: string | null;
};

/** Image slots for a Gulf Heritage page. */
export type GulfHeritagePageImages = {
  hero: GulfHeritageImageAsset | null;
  inline: readonly GulfHeritageImageAsset[];
  stepImages: readonly GulfHeritageImageAsset[];
  gallery: readonly GulfHeritageImageAsset[];
  equipment: readonly GulfHeritageImageAsset[];
  historical: readonly GulfHeritageImageAsset[];
  roasterLogo: GulfHeritageImageAsset | null;
  roasterCover: GulfHeritageImageAsset | null;
};

export function createEmptyGulfHeritageImageAsset(): GulfHeritageImageAsset {
  return {
    url: null,
    caption: null,
    altText: null,
    credit: null,
    license: null,
    photographer: null,
  };
}

export const EMPTY_GULF_HERITAGE_PAGE_IMAGES: GulfHeritagePageImages = {
  hero: null,
  inline: [],
  stepImages: [],
  gallery: [],
  equipment: [],
  historical: [],
  roasterLogo: null,
  roasterCover: null,
};

export function createEmptyGulfHeritagePageImages(): GulfHeritagePageImages {
  return {
    hero: null,
    inline: [],
    stepImages: [],
    gallery: [],
    equipment: [],
    historical: [],
    roasterLogo: null,
    roasterCover: null,
  };
}

export function resolveGulfHeritageImageUrl(image: GulfHeritageImageAsset | null | undefined): string | null {
  return image?.url ?? null;
}

export function resolveGulfHeritageImageAlt(
  image: GulfHeritageImageAsset | null | undefined,
  fallback: string,
): string {
  return image?.altText?.trim() ? image.altText : fallback;
}

export function hasGulfHeritageImageAsset(image: GulfHeritageImageAsset | null | undefined): boolean {
  return Boolean(image?.url);
}

export function hasGulfHeritageImageAssets(images: readonly GulfHeritageImageAsset[]): boolean {
  return images.some((image) => Boolean(image.url));
}
