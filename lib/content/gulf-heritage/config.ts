import { UAE_GULF_HERITAGE_CATEGORIES } from "@/lib/content/gulf-heritage/uae/categories";
import type { GulfHeritageCountryConfig } from "@/types/gulf-heritage";

/** Static Gulf Heritage tree — routing and hierarchy only; copy lives in i18n dictionaries. */
export const GULF_HERITAGE_COUNTRIES = [
  {
    slug: "united-arab-emirates",
    categories: UAE_GULF_HERITAGE_CATEGORIES,
    heroImageUrl: "/images/culture/majlis-gathering.png",
  },
  {
    slug: "saudi-arabia",
  },
  {
    slug: "oman",
  },
  {
    slug: "kuwait",
  },
  {
    slug: "qatar",
  },
  {
    slug: "bahrain",
  },
] as const satisfies readonly GulfHeritageCountryConfig[];
