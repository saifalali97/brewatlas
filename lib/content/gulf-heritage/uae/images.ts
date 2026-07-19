import type { GulfHeritagePageSlug } from "@/types/gulf-heritage";
import {
  createEmptyGulfHeritagePageImages,
  type GulfHeritagePageImages,
} from "@/types/gulf-heritage-images";

/** Image slots per UAE page — URLs empty until licensed assets are added. */
export const UAE_PAGE_IMAGES: Record<GulfHeritagePageSlug, GulfHeritagePageImages> = {
  "emirati-arabic-coffee": createEmptyGulfHeritagePageImages(),
  dallah: createEmptyGulfHeritagePageImages(),
  finjan: createEmptyGulfHeritagePageImages(),
  mihmas: createEmptyGulfHeritagePageImages(),
  cardamom: createEmptyGulfHeritagePageImages(),
  saffron: createEmptyGulfHeritagePageImages(),
  "coffee-hospitality": createEmptyGulfHeritagePageImages(),
  "coffee-etiquette": createEmptyGulfHeritagePageImages(),
  "coffee-serving-traditions": createEmptyGulfHeritagePageImages(),
  "karak-chai": createEmptyGulfHeritagePageImages(),
  "black-tea": createEmptyGulfHeritagePageImages(),
  "milk-tea": createEmptyGulfHeritagePageImages(),
  "saffron-tea": createEmptyGulfHeritagePageImages(),
  "mint-tea": createEmptyGulfHeritagePageImages(),
  "adani-tea": createEmptyGulfHeritagePageImages(),
  "raw-coffee-company": createEmptyGulfHeritagePageImages(),
  "the-espresso-lab": createEmptyGulfHeritagePageImages(),
  "seven-fortunes": createEmptyGulfHeritagePageImages(),
  "cypher-roastery": createEmptyGulfHeritagePageImages(),
  "boom-coffee": createEmptyGulfHeritagePageImages(),
  "gold-box-roastery": createEmptyGulfHeritagePageImages(),
  "nightjar-coffee": createEmptyGulfHeritagePageImages(),
};

export function getUaePageImages(slug: GulfHeritagePageSlug): GulfHeritagePageImages {
  return UAE_PAGE_IMAGES[slug] ?? createEmptyGulfHeritagePageImages();
}
