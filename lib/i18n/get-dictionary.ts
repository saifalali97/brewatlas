import "server-only";
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

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = loaders[locale] ?? loaders.en;
  return loader();
}
