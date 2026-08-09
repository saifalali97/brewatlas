import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";

/** Featured roastery shown on each Gulf country card (matches approved design). */
export type GulfFeaturedRoasterConfig = {
  nameMatch: string;
  displayName: string;
  fallbackLogoImage?: string;
};

export const GULF_FEATURED_ROASTER_LOOKUP: Record<GulfDirectoryCountrySlug, GulfFeaturedRoasterConfig> = {
  uae: {
    nameMatch: "RAW Coffee",
    displayName: "RAW Coffee Company",
    fallbackLogoImage: "/images/gulf-heritage/raw-coffee-company.webp",
  },
  "saudi-arabia": {
    nameMatch: "Camel Step",
    displayName: "Camel Step",
  },
  kuwait: {
    nameMatch: "VOL.1",
    displayName: "VOL.1 Roastery",
  },
  qatar: {
    nameMatch: "Vulcan",
    displayName: "Vulcan Coffee Roastery",
  },
  bahrain: {
    nameMatch: "Crust",
    displayName: "Crust & Crema",
  },
  oman: {
    nameMatch: "Windrose",
    displayName: "Windrose Coffee",
  },
};
