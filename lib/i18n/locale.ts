import "server-only";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isSupportedLocale, matchAcceptLanguage } from "@/lib/i18n/config";
import { LOCALE_COOKIE_NAME, type Locale } from "@/types/i18n";

/**
 * Resolves the current request's locale for use in Server
 * Components/Server Actions, in the same priority order `proxy.ts`
 * establishes for the cookie in the first place:
 *
 * 1. `brewatlas_locale` cookie -- the user's saved preference, set either
 *    by `setLocaleAction` (manual switch) or by `proxy.ts` the first
 *    time it detects a browser language.
 * 2. `Accept-Language` header, as a same-request fallback for the very
 *    first response before Proxy's cookie write has round-tripped back
 *    (Server Components can't set cookies themselves).
 * 3. `DEFAULT_LOCALE` ("en").
 *
 * This mirrors the "Saved user preference" + "Browser language"
 * priority Proxy uses, so Server Components and Proxy never disagree
 * about the resolved locale.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isSupportedLocale(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  const headerLocale = matchAcceptLanguage(headerStore.get("accept-language"));
  if (headerLocale) return headerLocale;

  return DEFAULT_LOCALE;
}
