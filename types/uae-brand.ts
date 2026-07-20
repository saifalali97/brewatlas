import type { CultureTopicWithSection } from "@/types/culture";

/**
 * Types for the UAE brand identity feature set: heritage highlight
 * cards, UAE-flagged roasters, the coffee map, and the curated
 * "Emirati Coffee Guide". Deliberately reuses `culture_sections` /
 * `culture_topics` (see `types/culture.ts`) as the source of truth for
 * long-form articles rather than duplicating content -- these types are
 * for the shorter, brand-facing surfaces layered on top of it.
 */

export const UAE_HERITAGE_CATEGORIES = [
  "history",
  "majlis",
  "hospitality",
  "etiquette",
  "dallah",
  "finjan",
  "serving",
  "unesco",
] as const;
export type HeritageCategory = (typeof UAE_HERITAGE_CATEGORIES)[number];

/** `public.uae_heritage_highlights` row, camelCased -- a short "fact card" for the Coffee Heritage brand section, optionally deep-linking to the full article that covers it. */
export type UaeHeritageHighlight = {
  id: string;
  slug: string;
  category: HeritageCategory;
  title: string;
  summary: string;
  iconKey: string | null;
  relatedSectionSlug: string | null;
  relatedTopicSlug: string | null;
  position: number;
};

export type DbUaeHeritageHighlightRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  icon_key: string | null;
  related_section_slug: string | null;
  related_topic_slug: string | null;
  position: number;
};

/** `public.roasters`, extended with the UAE brand columns (slug, emirate, city, description, featured, is_uae) added in `20260713280200_create_uae_brand_foundation.sql`. `logoUrl` is intentionally a generic placeholder path, never a real trademark. */
export type UaeRoaster = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  emirate: string | null;
  city: string | null;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  featured: boolean;
  isUae: boolean;
};

export type DbUaeRoasterRow = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  emirate: string | null;
  city: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  featured: boolean;
  is_uae: boolean;
};

export const UAE_MAP_LOCATION_TYPES = ["roaster", "cafe", "majlis", "roastery_cafe"] as const;
export type UaeCoffeeMapLocationType = (typeof UAE_MAP_LOCATION_TYPES)[number];

/** `public.uae_coffee_map_locations` row, camelCased -- backend/database foundation for a future interactive map ("no external maps yet", per requirement 5). */
export type UaeCoffeeMapLocation = {
  id: string;
  slug: string;
  name: string;
  locationType: UaeCoffeeMapLocationType;
  emirate: string;
  city: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  website: string | null;
  roasterId: string | null;
  featured: boolean;
};

export type DbUaeCoffeeMapLocationRow = {
  id: string;
  slug: string;
  name: string;
  location_type: string;
  emirate: string;
  city: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  website: string | null;
  roaster_id: string | null;
  featured: boolean;
};

/** One curated entry in the "Emirati Coffee Guide" (requirement 3). Points at an existing `culture_topics` article by slug rather than duplicating its content -- `topic` is resolved live by `getUaeCoffeeGuide()`, `null` if the article isn't published in the requested locale. */
export type UaeCoffeeGuideEntry = {
  slug: string;
  /** English fallback title; prefer looking up `titleKey` in `dictionary.culturePage` for the localized name. */
  title: string;
  /** Key into `dictionary.culturePage` for the localized guide entry title. */
  titleKey: "guideEntryArabicCoffee" | "guideEntryKarak" | "guideEntrySaffronTea" | "guideEntryBlackTea" | "guideEntryAdaniTea" | "guideEntryServingTraditions" | "guideEntryCoffeeCeremonies";
  iconKey: string;
  sectionSlug: string;
  topicSlug: string;
  topic: CultureTopicWithSection | null;
};
