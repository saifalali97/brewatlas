import type { GulfHeritageCategoryConfig } from "@/types/gulf-heritage";

/** UAE Gulf Heritage category tree — structure only; copy in i18n. */
export const UAE_GULF_HERITAGE_CATEGORIES = [
  {
    slug: "arabic-coffee",
    pageSlugs: [
      "emirati-arabic-coffee",
      "dallah",
      "finjan",
      "mihmas",
      "cardamom",
      "saffron",
      "coffee-hospitality",
      "coffee-etiquette",
      "coffee-serving-traditions",
    ],
  },
  {
    slug: "tea-karak",
    pageSlugs: ["karak-chai", "black-tea", "milk-tea", "saffron-tea", "mint-tea", "adani-tea"],
  },
  {
    slug: "uae-roasters",
    pageSlugs: [
      "raw-coffee-company",
      "the-espresso-lab",
      "seven-fortunes",
      "cypher-roastery",
      "boom-coffee",
      "gold-box-roastery",
      "nightjar-coffee",
    ],
  },
] as const satisfies readonly GulfHeritageCategoryConfig[];
