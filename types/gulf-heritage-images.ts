/** Image slots for a Gulf Heritage page — URLs remain null until licensed assets are added. */
export type GulfHeritagePageImages = {
  hero: string | null;
  gallery: readonly string[];
  equipment: readonly string[];
  historical: readonly string[];
  roasterLogo: string | null;
  roasterCover: string | null;
};

export const EMPTY_GULF_HERITAGE_PAGE_IMAGES: GulfHeritagePageImages = {
  hero: null,
  gallery: [],
  equipment: [],
  historical: [],
  roasterLogo: null,
  roasterCover: null,
};

export function createEmptyGulfHeritagePageImages(): GulfHeritagePageImages {
  return { ...EMPTY_GULF_HERITAGE_PAGE_IMAGES, gallery: [], equipment: [], historical: [] };
}
