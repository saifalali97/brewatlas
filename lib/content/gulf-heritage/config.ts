import { UAE_GULF_HERITAGE_CATEGORIES } from "@/lib/content/gulf-heritage/uae/categories";
import { GULF_HERITAGE_COUNTRY_HEROES } from "@/lib/media/page-images";
import type { GulfHeritageCountryConfig } from "@/types/gulf-heritage";

/** Static Gulf Heritage tree — routing and hierarchy only; copy lives in i18n dictionaries. */
export const GULF_HERITAGE_COUNTRIES = [
  {
    slug: "united-arab-emirates",
    categories: UAE_GULF_HERITAGE_CATEGORIES,
    heroImageUrl: GULF_HERITAGE_COUNTRY_HEROES["united-arab-emirates"],
  },
  {
    slug: "saudi-arabia",
    heroImageUrl: GULF_HERITAGE_COUNTRY_HEROES["saudi-arabia"],
  },
  {
    slug: "oman",
    heroImageUrl: GULF_HERITAGE_COUNTRY_HEROES.oman,
  },
  {
    slug: "kuwait",
    heroImageUrl: GULF_HERITAGE_COUNTRY_HEROES.kuwait,
  },
  {
    slug: "qatar",
    heroImageUrl: GULF_HERITAGE_COUNTRY_HEROES.qatar,
  },
  {
    slug: "bahrain",
    heroImageUrl: GULF_HERITAGE_COUNTRY_HEROES.bahrain,
  },
] as const satisfies readonly GulfHeritageCountryConfig[];
