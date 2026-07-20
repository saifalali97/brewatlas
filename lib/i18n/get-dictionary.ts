import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import type { Locale } from "@/types/i18n";
import type { Dictionary } from "@/lib/i18n/types";

/**
 * Loads the static UI dictionary for a locale. `server-only` (per the
 * official Next.js i18n pattern) so dictionary JSON never ends up in a
 * client bundle -- Client Components read the already-resolved
 * dictionary from `TranslationProvider`/`useTranslations` instead (see
 * `lib/i18n/translation-context.tsx`).
 *
 * Adding a new language later is exactly one line here plus one new
 * `lib/i18n/dictionaries/<locale>.ts` file typed as `Dictionary`.
 */
const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/lib/i18n/dictionaries/en").then((m) => m.default),
  ar: () => import("@/lib/i18n/dictionaries/ar").then((m) => m.default),
};

/**
 * Bump when dictionary namespaces/keys change so `unstable_cache` does not
 * serve a stale object missing newly added sections (e.g. aiCoachModule).
 */
const DICTIONARY_CACHE_VERSION = "2";

const DICTIONARY_CACHE_TTL = 3600;

async function loadDictionary(locale: Locale): Promise<Dictionary> {
  const loader = loaders[locale] ?? loaders.en;

  // Skip persistent cache in development so new dictionary keys (e.g.
  // aiCoachModule) are picked up without stale unstable_cache entries.
  if (process.env.NODE_ENV === "development") {
    return loader();
  }

  return unstable_cache(
    async () => loader(),
    ["dictionary", DICTIONARY_CACHE_VERSION, locale],
    { revalidate: DICTIONARY_CACHE_TTL, tags: ["dictionary", `dictionary-${locale}`] },
  )();
}

export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => loadDictionary(locale));
