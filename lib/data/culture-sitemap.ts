import type { SupabaseClient } from "@supabase/supabase-js";

export type CultureTopicSitemapEntry = {
  sectionSlug: string;
  topicSlug: string;
  lastModified: Date;
};

export type CultureSectionSitemapEntry = {
  slug: string;
  lastModified: Date;
};

/** Published culture section paths for sitemap generation. */
export async function getCultureSectionSitemapEntries(
  supabase: SupabaseClient,
): Promise<CultureSectionSitemapEntry[]> {
  const { data, error } = await supabase
    .from("culture_sections")
    .select("slug, updated_at")
    .eq("locale", "en")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("getCultureSectionSitemapEntries failed", error);
    return [];
  }

  const seen = new Set<string>();
  return data.flatMap((row) => {
    if (typeof row.slug !== "string" || seen.has(row.slug)) return [];
    seen.add(row.slug);
    return [
      {
        slug: row.slug,
        lastModified: row.updated_at ? new Date(row.updated_at as string) : new Date(),
      },
    ];
  });
}

/** Published culture topic paths for sitemap generation. */
export async function getCultureTopicSitemapEntries(
  supabase: SupabaseClient,
): Promise<CultureTopicSitemapEntry[]> {
  const { data, error } = await supabase
    .from("culture_topics")
    .select("slug, updated_at, culture_sections!inner ( slug )")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("getCultureTopicSitemapEntries failed", error);
    return [];
  }

  return data.flatMap((row) => {
    const sectionData = row.culture_sections as { slug: string } | { slug: string }[] | null;
    const section = Array.isArray(sectionData) ? sectionData[0] : sectionData;
    if (!section?.slug || typeof row.slug !== "string") return [];

    return [
      {
        sectionSlug: section.slug,
        topicSlug: row.slug,
        lastModified: row.updated_at ? new Date(row.updated_at as string) : new Date(),
      },
    ];
  });
}
