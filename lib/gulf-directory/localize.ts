import type { Dictionary } from "@/lib/i18n/types";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";

export function getGulfCountryCopy(dictionary: Dictionary, slug: GulfDirectoryCountrySlug) {
  return dictionary.recipesDirectory.countries[slug];
}
