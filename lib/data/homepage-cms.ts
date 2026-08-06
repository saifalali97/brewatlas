import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Locale } from "@/types/i18n";
import type { FeaturedRecipe, HomeContent } from "@/types/homepage";
import { getHomeContent as getStaticHomeContent } from "@/lib/i18n/get-home-content";

export const HOMEPAGE_SECTION_KEYS = [
  "brew_methods",
  "coffee_origins",
  "top_roasters",
  "testimonials",
  "pricing_plans",
  "faqs",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

export type HomepageHeroBanner = {
  id: string;
  locale: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  mediaAssetId: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  published: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type HomepageFeaturedRecipeRow = {
  id: string;
  locale: string;
  recipeId: string | null;
  displayName: string | null;
  displayImageUrl: string | null;
  mediaAssetId: string | null;
  displayCountry: string | null;
  displayOrigin: string | null;
  displayBrewMethod: string | null;
  displayNotes: string | null;
  published: boolean;
  position: number;
};

export type HomepageSectionRow = {
  id: string;
  locale: string;
  sectionKey: string;
  title: string | null;
  content: unknown;
  published: boolean;
  position: number;
  updatedAt: string;
};

export const HOMEPAGE_CMS_PAGE_SIZE = 15;

export async function getHomepageHeroBannersPage(
  supabase: SupabaseClient,
  locale: Locale,
  page = 1,
  search = "",
): Promise<{ items: HomepageHeroBanner[]; totalCount: number; page: number; pageSize: number }> {
  const pageSize = HOMEPAGE_CMS_PAGE_SIZE;
  const offset = (Math.max(1, page) - 1) * pageSize;

  let query = supabase
    .from("homepage_hero_banners")
    .select("*", { count: "exact" })
    .eq("locale", locale);

  if (search) query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%`);

  const { data, error, count } = await query.order("position", { ascending: true }).range(offset, offset + pageSize - 1);
  if (error) {
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data ?? []).map(mapHeroRow),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

function mapHeroRow(row: Record<string, unknown>): HomepageHeroBanner {
  return {
    id: String(row.id),
    locale: String(row.locale),
    eyebrow: (row.eyebrow as string | null) ?? null,
    title: String(row.title),
    subtitle: (row.subtitle as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    mediaAssetId: (row.media_asset_id as string | null) ?? null,
    ctaLabel: (row.cta_label as string | null) ?? null,
    ctaHref: (row.cta_href as string | null) ?? null,
    published: Boolean(row.published),
    position: Number(row.position ?? 0),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function getHomepageHeroBannerById(
  supabase: SupabaseClient,
  id: string,
): Promise<HomepageHeroBanner | null> {
  const { data, error } = await supabase.from("homepage_hero_banners").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapHeroRow(data as Record<string, unknown>);
}

export async function getPublishedHomepageHeroImage(
  supabase: SupabaseClient,
  locale: Locale,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("homepage_hero_banners")
    .select("image_url, media_assets(public_url)")
    .eq("locale", locale)
    .eq("published", true)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  const media = data.media_assets as { public_url?: string } | { public_url?: string }[] | null;
  const asset = Array.isArray(media) ? media[0] : media;
  return asset?.public_url ?? (data.image_url as string | null) ?? null;
}

export async function getHomepageFeaturedRecipesPage(
  supabase: SupabaseClient,
  locale: Locale,
  page = 1,
): Promise<{ items: HomepageFeaturedRecipeRow[]; totalCount: number; page: number; pageSize: number }> {
  const pageSize = HOMEPAGE_CMS_PAGE_SIZE;
  const offset = (Math.max(1, page) - 1) * pageSize;

  const { data, error, count } = await supabase
    .from("homepage_featured_recipes")
    .select("*", { count: "exact" })
    .eq("locale", locale)
    .order("position", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data ?? []).map(mapFeaturedRow),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

function mapFeaturedRow(row: Record<string, unknown>): HomepageFeaturedRecipeRow {
  return {
    id: String(row.id),
    locale: String(row.locale),
    recipeId: (row.recipe_id as string | null) ?? null,
    displayName: (row.display_name as string | null) ?? null,
    displayImageUrl: (row.display_image_url as string | null) ?? null,
    mediaAssetId: (row.media_asset_id as string | null) ?? null,
    displayCountry: (row.display_country as string | null) ?? null,
    displayOrigin: (row.display_origin as string | null) ?? null,
    displayBrewMethod: (row.display_brew_method as string | null) ?? null,
    displayNotes: (row.display_notes as string | null) ?? null,
    published: Boolean(row.published),
    position: Number(row.position ?? 0),
  };
}

export async function getHomepageFeaturedRecipeById(
  supabase: SupabaseClient,
  id: string,
): Promise<HomepageFeaturedRecipeRow | null> {
  const { data, error } = await supabase.from("homepage_featured_recipes").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapFeaturedRow(data as Record<string, unknown>);
}

export async function getHomepageSectionsForLocale(
  supabase: SupabaseClient,
  locale: Locale,
): Promise<HomepageSectionRow[]> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("locale", locale)
    .order("position", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    locale: row.locale,
    sectionKey: row.section_key,
    title: row.title,
    content: row.content,
    published: row.published,
    position: row.position,
    updatedAt: row.updated_at,
  }));
}

export async function getHomepageSectionByKey(
  supabase: SupabaseClient,
  locale: Locale,
  sectionKey: string,
): Promise<HomepageSectionRow | null> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("locale", locale)
    .eq("section_key", sectionKey)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    locale: data.locale,
    sectionKey: data.section_key,
    title: data.title,
    content: data.content,
    published: data.published,
    position: data.position,
    updatedAt: data.updated_at,
  };
}

function featuredRowToCard(row: HomepageFeaturedRecipeRow): FeaturedRecipe | null {
  if (!row.displayName) return null;
  return {
    name: row.displayName,
    country: row.displayCountry ?? "",
    origin: row.displayOrigin ?? "",
    brewMethod: row.displayBrewMethod ?? "",
    roastLevel: "",
    difficulty: "Intermediate",
    ratio: "",
    time: "",
    notes: row.displayNotes ?? "",
    image: row.displayImageUrl ?? "",
    featured: true,
  };
}

/** Merges CMS database content with static fallback for the public homepage. */
export async function getMergedHomeContent(supabase: SupabaseClient, locale: Locale): Promise<HomeContent> {
  const staticContent = await getStaticHomeContent(locale);

  try {
    const [heroImage, featuredRows, sections] = await Promise.all([
      getPublishedHomepageHeroImage(supabase, locale),
      supabase
        .from("homepage_featured_recipes")
        .select("*")
        .eq("locale", locale)
        .eq("published", true)
        .order("position", { ascending: true }),
      getHomepageSectionsForLocale(supabase, locale),
    ]);

    const cmsFeatured = featuredRows.error
      ? []
      : (featuredRows.data ?? [])
            .map((row) => featuredRowToCard(mapFeaturedRow(row as Record<string, unknown>)))
            .filter((item): item is FeaturedRecipe => item !== null);

    const sectionMap = new Map(sections.filter((s) => s.published).map((s) => [s.sectionKey, s.content]));

    return {
      heroImage: heroImage ?? staticContent.heroImage,
      featuredRecipes: cmsFeatured,
      brewMethods:
        (sectionMap.get("brew_methods") as HomeContent["brewMethods"] | undefined) ?? staticContent.brewMethods,
      coffeeOrigins:
        (sectionMap.get("coffee_origins") as HomeContent["coffeeOrigins"] | undefined) ??
        staticContent.coffeeOrigins,
      topRoasters:
        (sectionMap.get("top_roasters") as HomeContent["topRoasters"] | undefined) ?? staticContent.topRoasters,
      testimonials:
        (sectionMap.get("testimonials") as HomeContent["testimonials"] | undefined) ?? staticContent.testimonials,
      pricingPlans:
        (sectionMap.get("pricing_plans") as HomeContent["pricingPlans"] | undefined) ?? staticContent.pricingPlans,
      faqs: (sectionMap.get("faqs") as HomeContent["faqs"] | undefined) ?? staticContent.faqs,
    };
  } catch {
    return staticContent;
  }
}
