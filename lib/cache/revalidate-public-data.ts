import { updateTag } from "next/cache";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";

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

/** Busts cached Gulf Directory country/city/roaster reads. */
export function revalidateGulfDirectoryCache(options?: {
  countrySlug?: GulfDirectoryCountrySlug;
}): void {
  updateTag("gulf-directory");
  updateTag("gulf-countries");
  updateTag("gulf-cities");
  updateTag("gulf-roasters");

  if (options?.countrySlug) {
    updateTag(`gulf-country-${options.countrySlug}`);
  }
}
