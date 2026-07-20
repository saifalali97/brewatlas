import { updateTag } from "next/cache";

/** Busts cached public recipe listings after publish/update/delete mutations. */
export function revalidatePublishedRecipesCache(): void {
  updateTag("recipes");
  updateTag("published-recipes");
}

/** Busts cached culture hub/section/topic reads after CMS mutations. */
export function revalidateCulturePublicCache(options?: {
  sectionSlug?: string;
  topicSlug?: string;
}): void {
  updateTag("culture");
  updateTag("culture-sections");

  if (options?.sectionSlug) {
    updateTag(`culture-section-${options.sectionSlug}`);
    if (options?.topicSlug) {
      updateTag(`culture-topic-${options.sectionSlug}-${options.topicSlug}`);
    }
  }
}
