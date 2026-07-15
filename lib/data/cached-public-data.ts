import "server-only";

import { unstable_cache } from "next/cache";
import {
  getCultureSectionBySlug,
  getCultureSections,
  getCultureTopicBySlug,
} from "@/lib/data/culture";
import { getPublishedDbRecipes } from "@/lib/data/db-recipes";
import { createPublicClient } from "@/lib/supabase/public";
import type { Locale } from "@/types/i18n";
import type { CultureSectionWithTopicCount, CultureSectionWithTopics, CultureTopicWithSection } from "@/types/culture";
import type { RecipeListItem } from "@/types/recipe";

const PUBLIC_CACHE_TTL = 300;

export async function getCachedPublishedDbRecipes(locale: Locale): Promise<RecipeListItem[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getPublishedDbRecipes(supabase, { locale });
    },
    ["cached-published-db-recipes", locale],
    { revalidate: PUBLIC_CACHE_TTL, tags: ["recipes", "published-recipes"] },
  )();
}

export async function getCachedCultureSections(locale: Locale): Promise<CultureSectionWithTopicCount[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getCultureSections(supabase, locale);
    },
    ["cached-culture-sections", locale],
    { revalidate: PUBLIC_CACHE_TTL, tags: ["culture", "culture-sections"] },
  )();
}

export async function getCachedCultureSectionBySlug(
  sectionSlug: string,
  locale: Locale,
): Promise<CultureSectionWithTopics | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getCultureSectionBySlug(supabase, sectionSlug, locale);
    },
    ["cached-culture-section", sectionSlug, locale],
    { revalidate: PUBLIC_CACHE_TTL, tags: ["culture", `culture-section-${sectionSlug}`] },
  )();
}

export async function getCachedCultureTopicBySlug(
  sectionSlug: string,
  topicSlug: string,
  locale: Locale,
): Promise<CultureTopicWithSection | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getCultureTopicBySlug(supabase, sectionSlug, topicSlug, locale);
    },
    ["cached-culture-topic", sectionSlug, topicSlug, locale],
    { revalidate: PUBLIC_CACHE_TTL, tags: ["culture", `culture-topic-${sectionSlug}-${topicSlug}`] },
  )();
}
