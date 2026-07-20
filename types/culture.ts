/**
 * Types for the "Culture" content area (`culture_sections` /
 * `culture_topics`): editorial articles about UAE coffee culture, Arabic
 * coffee, and tea. Deliberately generic ("sections" containing "topics")
 * so new sections can be added later without any schema changes.
 */

/** `public.culture_sections` row, as selected server-side. */
export type CultureSectionRow = {
  id: string;
  slug: string;
  locale: string;
  eyebrow: string | null;
  name: string;
  description: string;
  heroImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  position: number;
};

/** `public.culture_sections` combined with a count of its published topics, for the hub listing page. */
export type CultureSectionWithTopicCount = CultureSectionRow & {
  topicCount: number;
};

/** `public.culture_topics` row, as selected server-side. */
export type CultureTopicRow = {
  id: string;
  sectionId: string;
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  body: string;
  heroImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  position: number;
};

/** A section with all of its topics, for the section listing page. */
export type CultureSectionWithTopics = CultureSectionRow & {
  topics: CultureTopicRow[];
};

/** A topic plus a light reference to its parent section, for breadcrumbs and related-content links. */
export type CultureTopicWithSection = CultureTopicRow & {
  section: Pick<CultureSectionRow, "id" | "slug" | "name">;
};

export const CULTURE_IMAGE_PLACEHOLDER = "/images/fallback/coffee-placeholder.webp";
