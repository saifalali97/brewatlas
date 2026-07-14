import { DEFAULT_LOCALE, LOCALE_METADATA, RTL_LOCALES, SUPPORTED_LOCALES, type Locale, type TextDirection } from "@/types/i18n";

/**
 * Locale-related pure helpers shared by the server (`proxy.ts`,
 * `lib/i18n/locale.ts`) and client (`LanguageSwitcher`) sides of the i18n
 * system. No I/O -- see `lib/i18n/locale.ts` for the Next.js-specific
 * (cookies/headers) resolution.
 */

export { DEFAULT_LOCALE, LOCALE_METADATA, RTL_LOCALES, SUPPORTED_LOCALES };
export type { Locale, TextDirection };

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function isRtl(locale: Locale): boolean {
  return (RTL_LOCALES as readonly Locale[]).includes(locale);
}

export function directionFor(locale: Locale): TextDirection {
  return isRtl(locale) ? "rtl" : "ltr";
}

/**
 * Parses an `Accept-Language` header (e.g. `"ar-AE,ar;q=0.9,en;q=0.8"`)
 * and returns the first supported locale, or `null` if none of the
 * client's preferences are supported. Deliberately dependency-free
 * (no `negotiator`/`@formatjs/intl-localematcher`) -- BrewAtlas only
 * supports two locales today and this is trivial to extend as more are
 * added.
 */
export function matchAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const preferences = header
    .split(",")
    .map((part) => {
      const [tag, qValue] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), quality: qValue ? Number(qValue) : 1 };
    })
    .filter((pref) => Number.isFinite(pref.quality))
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of preferences) {
    const primary = tag.split("-")[0];
    const match = SUPPORTED_LOCALES.find((locale) => locale === tag || locale === primary);
    if (match) return match;
  }

  return null;
}
