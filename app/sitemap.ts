import type { MetadataRoute } from "next";
import {
  getCultureSectionSitemapEntries,
  getCultureTopicSitemapEntries,
} from "@/lib/data/culture-sitemap";
import { listGulfHeritageSitemapPaths } from "@/lib/content/gulf-heritage";
import { getAllRecipeSlugs } from "@/lib/data/recipes";
import { getPublishedRecipeSlugs } from "@/lib/data/recipe-publishing";
import { buildHreflangAlternates } from "@/lib/seo/localized-metadata";
import { getSiteUrl } from "@/lib/seo/site";
import { createClient } from "@/lib/supabase/server";

/** Public App Router pages included in the sitemap. */
const publicPages: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/recipes", changeFrequency: "weekly", priority: 0.9 },
  { path: "/search", changeFrequency: "weekly", priority: 0.85 },
  { path: "/methods", changeFrequency: "monthly", priority: 0.8 },
  { path: "/origins", changeFrequency: "monthly", priority: 0.8 },
  { path: "/roasters", changeFrequency: "monthly", priority: 0.8 },
  { path: "/devices", changeFrequency: "monthly", priority: 0.7 },
  { path: "/devices/xbloom", changeFrequency: "monthly", priority: 0.6 },
  { path: "/coach", changeFrequency: "monthly", priority: 0.7 },
  { path: "/community", changeFrequency: "weekly", priority: 0.6 },
  { path: "/premium", changeFrequency: "monthly", priority: 0.8 },
  { path: "/culture", changeFrequency: "monthly", priority: 0.7 },
  { path: "/culture/guide", changeFrequency: "monthly", priority: 0.6 },
  { path: "/gulf-heritage", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();
  const supabase = await createClient();
  const [dbPublished, cultureTopics, cultureSections] = await Promise.all([
    getPublishedRecipeSlugs(supabase),
    getCultureTopicSitemapEntries(supabase),
    getCultureSectionSitemapEntries(supabase),
  ]);

  const gulfHeritagePaths = listGulfHeritageSitemapPaths().filter(({ path }) => path !== "/gulf-heritage");

  const staticEntries = [
    ...publicPages.map(({ path, changeFrequency, priority }) => ({
      url: path === "/" ? baseUrl : `${baseUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages: buildHreflangAlternates(path) },
    })),
    ...gulfHeritagePaths.map(({ path, priority }) => ({
      url: `${baseUrl}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages: buildHreflangAlternates(path) },
    })),
  ];

  const staticSlugs = new Set(getAllRecipeSlugs());

  const recipeEntries = [
    ...getAllRecipeSlugs().map((slug) => ({
      url: `${baseUrl}/recipes/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: buildHreflangAlternates(`/recipes/${slug}`) },
    })),
    ...dbPublished
      .filter(({ slug }) => !staticSlugs.has(slug))
      .map(({ slug, updatedAt }) => ({
        url: `${baseUrl}/recipes/${slug}`,
        lastModified: new Date(updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: { languages: buildHreflangAlternates(`/recipes/${slug}`) },
      })),
  ];

  const cultureSectionEntries = cultureSections.map(({ slug, lastModified: sectionUpdatedAt }) => {
    const path = `/culture/${slug}`;
    return {
      url: `${baseUrl}${path}`,
      lastModified: sectionUpdatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: { languages: buildHreflangAlternates(path) },
    };
  });

  const cultureEntries = cultureTopics.map(({ sectionSlug, topicSlug, lastModified: topicUpdatedAt }) => {
    const path = `/culture/${sectionSlug}/${topicSlug}`;
    return {
      url: `${baseUrl}${path}`,
      lastModified: topicUpdatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.55,
      alternates: { languages: buildHreflangAlternates(path) },
    };
  });

  return [...staticEntries, ...recipeEntries, ...cultureSectionEntries, ...cultureEntries];
}
