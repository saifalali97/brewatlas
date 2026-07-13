import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CultureSectionRow,
  CultureSectionWithTopicCount,
  CultureSectionWithTopics,
  CultureTopicRow,
  CultureTopicWithSection,
} from "@/types/culture";

/**
 * Data-access layer for the "Culture" content area (`culture_sections`,
 * `culture_topics`) that powers `/culture`, `/culture/[section]`, and
 * `/culture/[section]/[topic]`. All content is admin-managed editorial
 * content (no user ownership), so these functions only ever read.
 *
 * `locale` defaults to "en" everywhere -- passing a different locale is
 * how a future translated build of these pages would read translated
 * rows without any other code changes.
 */

const DEFAULT_LOCALE = "en";

type DbSectionRow = {
  id: string;
  slug: string;
  locale: string;
  eyebrow: string | null;
  name: string;
  description: string;
  hero_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  position: number;
};

type DbSectionWithTopicCountRow = DbSectionRow & { culture_topics: { id: string }[] };

type DbTopicRow = {
  id: string;
  section_id: string;
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  body: string;
  hero_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  position: number;
};

const SECTION_FIELDS = "id, slug, locale, eyebrow, name, description, hero_image_url, seo_title, seo_description, position";
const TOPIC_FIELDS = "id, section_id, slug, locale, title, excerpt, body, hero_image_url, seo_title, seo_description, position";

function mapSection(row: DbSectionRow): CultureSectionRow {
  return {
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    eyebrow: row.eyebrow,
    name: row.name,
    description: row.description,
    heroImageUrl: row.hero_image_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    position: row.position,
  };
}

function mapTopic(row: DbTopicRow): CultureTopicRow {
  return {
    id: row.id,
    sectionId: row.section_id,
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    heroImageUrl: row.hero_image_url,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    position: row.position,
  };
}

/** All published culture sections (e.g. UAE Coffee Culture, Arabic Coffee, Tea), with a topic count, for the `/culture` hub. */
export async function getCultureSections(
  supabase: SupabaseClient,
  locale: string = DEFAULT_LOCALE,
): Promise<CultureSectionWithTopicCount[]> {
  const { data, error } = await supabase
    .from("culture_sections")
    .select(`${SECTION_FIELDS}, culture_topics ( id )`)
    .eq("locale", locale)
    .order("position", { ascending: true });

  if (error) {
    console.error("getCultureSections failed", error);
    return [];
  }

  return (data as unknown as DbSectionWithTopicCountRow[]).map((row) => ({
    ...mapSection(row),
    topicCount: row.culture_topics.length,
  }));
}

/** A single culture section by slug, with its published topics ordered for display, for `/culture/[section]`. */
export async function getCultureSectionBySlug(
  supabase: SupabaseClient,
  sectionSlug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<CultureSectionWithTopics | null> {
  const { data: sectionData, error: sectionError } = await supabase
    .from("culture_sections")
    .select(SECTION_FIELDS)
    .eq("slug", sectionSlug)
    .eq("locale", locale)
    .maybeSingle();

  if (sectionError || !sectionData) return null;

  const { data: topicsData, error: topicsError } = await supabase
    .from("culture_topics")
    .select(TOPIC_FIELDS)
    .eq("section_id", sectionData.id)
    .eq("locale", locale)
    .order("position", { ascending: true });

  if (topicsError) {
    console.error("getCultureSectionBySlug failed to load topics", topicsError);
  }

  return {
    ...mapSection(sectionData as DbSectionRow),
    topics: ((topicsData ?? []) as DbTopicRow[]).map(mapTopic),
  };
}

/** A single culture topic by its section + topic slug, with its parent section's id/slug/name, for `/culture/[section]/[topic]`. */
export async function getCultureTopicBySlug(
  supabase: SupabaseClient,
  sectionSlug: string,
  topicSlug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<CultureTopicWithSection | null> {
  const { data, error } = await supabase
    .from("culture_topics")
    .select(`${TOPIC_FIELDS}, culture_sections!inner ( id, slug, name )`)
    .eq("slug", topicSlug)
    .eq("locale", locale)
    .eq("culture_sections.slug", sectionSlug)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as DbTopicRow & { culture_sections: { id: string; slug: string; name: string } };

  return {
    ...mapTopic(row),
    section: row.culture_sections,
  };
}
