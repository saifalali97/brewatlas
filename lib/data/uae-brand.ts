import type { SupabaseClient } from "@supabase/supabase-js";
import { getCultureTopicBySlug } from "@/lib/data/culture";
import type {
  DbUaeCoffeeMapLocationRow,
  DbUaeHeritageHighlightRow,
  DbUaeRoasterRow,
  HeritageCategory,
  UaeCoffeeGuideEntry,
  UaeCoffeeMapLocation,
  UaeCoffeeMapLocationType,
  UaeHeritageHighlight,
  UaeRoaster,
} from "@/types/uae-brand";

/**
 * Data-access layer for the UAE brand identity feature set: heritage
 * highlight cards, UAE-featured roasters, coffee-map locations, and the
 * curated "Emirati Coffee Guide". All content is admin-managed editorial
 * data (no user ownership), so these functions only ever read.
 */

const DEFAULT_LOCALE = "en";

const HERITAGE_FIELDS =
  "id, slug, category, title, summary, icon_key, related_section_slug, related_topic_slug, position";
const ROASTER_FIELDS =
  "id, name, slug, country, emirate, city, website, logo_url, description, featured, is_uae";
const MAP_LOCATION_FIELDS =
  "id, slug, name, location_type, emirate, city, address, latitude, longitude, description, website, roaster_id, featured";

function mapHeritageHighlight(row: DbUaeHeritageHighlightRow): UaeHeritageHighlight {
  return {
    id: row.id,
    slug: row.slug,
    category: row.category as HeritageCategory,
    title: row.title,
    summary: row.summary,
    iconKey: row.icon_key,
    relatedSectionSlug: row.related_section_slug,
    relatedTopicSlug: row.related_topic_slug,
    position: row.position,
  };
}

function mapRoaster(row: DbUaeRoasterRow): UaeRoaster {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    country: row.country,
    emirate: row.emirate,
    city: row.city,
    website: row.website,
    logoUrl: row.logo_url,
    description: row.description,
    featured: row.featured,
    isUae: row.is_uae,
  };
}

function mapMapLocation(row: DbUaeCoffeeMapLocationRow): UaeCoffeeMapLocation {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    locationType: row.location_type as UaeCoffeeMapLocationType,
    emirate: row.emirate,
    city: row.city,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    description: row.description,
    website: row.website,
    roasterId: row.roaster_id,
    featured: row.featured,
  };
}

/** All published heritage highlight cards, ordered for display, for the "Coffee Heritage" brand section. */
export async function getUaeHeritageHighlights(supabase: SupabaseClient): Promise<UaeHeritageHighlight[]> {
  const { data, error } = await supabase
    .from("uae_heritage_highlights")
    .select(HERITAGE_FIELDS)
    .eq("published", true)
    .order("position", { ascending: true });

  if (error) {
    console.error("getUaeHeritageHighlights failed", error);
    return [];
  }

  return (data as DbUaeHeritageHighlightRow[]).map(mapHeritageHighlight);
}

type GetUaeRoastersOptions = {
  featuredOnly?: boolean;
  limit?: number;
};

/** UAE-flagged roasters (`is_uae = true`), optionally restricted to featured ones, for the "UAE Featured Roasters" brand section. */
export async function getUaeRoasters(
  supabase: SupabaseClient,
  options: GetUaeRoastersOptions = {},
): Promise<UaeRoaster[]> {
  let query = supabase
    .from("roasters")
    .select(ROASTER_FIELDS)
    .eq("is_uae", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (options.featuredOnly) {
    query = query.eq("featured", true);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getUaeRoasters failed", error);
    return [];
  }

  return (data as DbUaeRoasterRow[]).map(mapRoaster);
}

type GetUaeCoffeeMapLocationsOptions = {
  emirate?: string;
  featuredOnly?: boolean;
};

/** Published coffee-map locations, optionally filtered by emirate or featured status -- backend foundation for a future interactive map. */
export async function getUaeCoffeeMapLocations(
  supabase: SupabaseClient,
  options: GetUaeCoffeeMapLocationsOptions = {},
): Promise<UaeCoffeeMapLocation[]> {
  let query = supabase
    .from("uae_coffee_map_locations")
    .select(MAP_LOCATION_FIELDS)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (options.emirate) {
    query = query.eq("emirate", options.emirate);
  }
  if (options.featuredOnly) {
    query = query.eq("featured", true);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getUaeCoffeeMapLocations failed", error);
    return [];
  }

  return (data as DbUaeCoffeeMapLocationRow[]).map(mapMapLocation);
}

type UpsertHeritageHighlightInput = {
  slug: string;
  category: HeritageCategory;
  title: string;
  summary: string;
  iconKey?: string | null;
  relatedSectionSlug?: string | null;
  relatedTopicSlug?: string | null;
  position?: number;
};

/** Creates or updates (by `slug`) a heritage highlight card. RLS restricts writes to admins. */
export async function upsertHeritageHighlight(
  supabase: SupabaseClient,
  input: UpsertHeritageHighlightInput,
): Promise<UaeHeritageHighlight | null> {
  const { data, error } = await supabase
    .from("uae_heritage_highlights")
    .upsert(
      {
        slug: input.slug,
        category: input.category,
        title: input.title,
        summary: input.summary,
        icon_key: input.iconKey ?? null,
        related_section_slug: input.relatedSectionSlug ?? null,
        related_topic_slug: input.relatedTopicSlug ?? null,
        position: input.position ?? 0,
      },
      { onConflict: "slug" },
    )
    .select(HERITAGE_FIELDS)
    .single();

  if (error || !data) {
    console.error("upsertHeritageHighlight failed", error);
    return null;
  }

  return mapHeritageHighlight(data as DbUaeHeritageHighlightRow);
}

type UpsertUaeCoffeeMapLocationInput = {
  slug: string;
  name: string;
  locationType: UaeCoffeeMapLocationType;
  emirate: string;
  city?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  description?: string | null;
  website?: string | null;
  roasterId?: string | null;
  featured?: boolean;
};

/** Creates or updates (by `slug`) a coffee-map location. RLS restricts writes to admins. */
export async function upsertUaeCoffeeMapLocation(
  supabase: SupabaseClient,
  input: UpsertUaeCoffeeMapLocationInput,
): Promise<UaeCoffeeMapLocation | null> {
  const { data, error } = await supabase
    .from("uae_coffee_map_locations")
    .upsert(
      {
        slug: input.slug,
        name: input.name,
        location_type: input.locationType,
        emirate: input.emirate,
        city: input.city ?? null,
        address: input.address ?? null,
        latitude: input.latitude,
        longitude: input.longitude,
        description: input.description ?? null,
        website: input.website ?? null,
        roaster_id: input.roasterId ?? null,
        featured: input.featured ?? false,
      },
      { onConflict: "slug" },
    )
    .select(MAP_LOCATION_FIELDS)
    .single();

  if (error || !data) {
    console.error("upsertUaeCoffeeMapLocation failed", error);
    return null;
  }

  return mapMapLocation(data as DbUaeCoffeeMapLocationRow);
}

/**
 * The curated "Emirati Coffee Guide": Arabic Coffee, Karak, Saffron Tea,
 * Black Tea, Adani Tea, Serving Traditions, and Coffee Ceremonies. Each
 * entry points at an existing `culture_topics` article rather than
 * duplicating its content -- resolved live so edits to the underlying
 * article are reflected automatically.
 */
const UAE_COFFEE_GUIDE_INDEX: Array<Omit<UaeCoffeeGuideEntry, "topic">> = [
  {
    slug: "arabic-coffee",
    title: "Arabic Coffee",
    titleKey: "guideEntryArabicCoffee",
    iconKey: "Coffee",
    sectionSlug: "arabic-coffee",
    topicSlug: "traditional-arabic-coffee",
  },
  {
    slug: "karak",
    title: "Karak",
    titleKey: "guideEntryKarak",
    iconKey: "CupSoda",
    sectionSlug: "tea",
    topicSlug: "karak",
  },
  {
    slug: "saffron-tea",
    title: "Saffron Tea",
    titleKey: "guideEntrySaffronTea",
    iconKey: "Flower2",
    sectionSlug: "tea",
    topicSlug: "saffron-tea",
  },
  {
    slug: "black-tea",
    title: "Black Tea",
    titleKey: "guideEntryBlackTea",
    iconKey: "Leaf",
    sectionSlug: "tea",
    topicSlug: "black-tea",
  },
  {
    slug: "adani-tea",
    title: "Adani Tea",
    titleKey: "guideEntryAdaniTea",
    iconKey: "Leaf",
    sectionSlug: "tea",
    topicSlug: "adani-tea",
  },
  {
    slug: "serving-traditions",
    title: "Serving Traditions",
    titleKey: "guideEntryServingTraditions",
    iconKey: "Sparkles",
    sectionSlug: "arabic-coffee",
    topicSlug: "serving-traditions",
  },
  {
    slug: "coffee-ceremonies",
    title: "Coffee Ceremonies",
    titleKey: "guideEntryCoffeeCeremonies",
    iconKey: "Flame",
    sectionSlug: "arabic-coffee",
    topicSlug: "traditional-brewing-methods",
  },
];

/** Resolves the curated guide index against live `culture_topics` rows; entries whose article isn't published in `locale` resolve with `topic: null` and are safe to filter out or render as "coming soon". */
export async function getUaeCoffeeGuide(
  supabase: SupabaseClient,
  locale: string = DEFAULT_LOCALE,
): Promise<UaeCoffeeGuideEntry[]> {
  const entries = await Promise.all(
    UAE_COFFEE_GUIDE_INDEX.map(async (entry) => ({
      ...entry,
      topic: await getCultureTopicBySlug(supabase, entry.sectionSlug, entry.topicSlug, locale),
    })),
  );

  return entries;
}
