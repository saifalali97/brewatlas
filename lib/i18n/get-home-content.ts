import "server-only";
import type { Locale } from "@/types/i18n";
import type { HomeContent } from "@/types/homepage";

/**
 * Loads the static homepage content (featured recipes, brewing methods,
 * coffee origins, top roasters, testimonials, pricing plans, FAQs) for a
 * locale. Mirrors `lib/i18n/get-dictionary.ts` exactly -- `server-only` so
 * this never ends up in a client bundle; Client Components that need this
 * content receive it as props from a Server Component (see
 * `app/(site)/page.tsx`) instead of loading it themselves.
 *
 * Adding a new language later is exactly one line here plus one new
 * `lib/i18n/home-content/<locale>.ts` file typed as `HomeContent`.
 */
const loaders: Record<Locale, () => Promise<HomeContent>> = {
  en: () => import("@/lib/i18n/home-content/en").then((m) => m.default),
  ar: () => import("@/lib/i18n/home-content/ar").then((m) => m.default),
};

export async function getHomeContent(locale: Locale): Promise<HomeContent> {
  const loader = loaders[locale] ?? loaders.en;
  return loader();
}
