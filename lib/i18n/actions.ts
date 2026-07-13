"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSupportedLocale } from "@/lib/i18n/config";
import { LOCALE_COOKIE_NAME } from "@/types/i18n";

/**
 * Manual language switch: persists the caller's chosen locale in the
 * `brewatlas_locale` cookie for one year, so it's respected on every
 * subsequent request ahead of browser-language detection (see
 * `lib/i18n/locale.ts#getLocale` and `proxy.ts`). Called from
 * `<LanguageSwitcher>`.
 */
export async function setLocaleAction(formData: FormData): Promise<void> {
  const locale = formData.get("locale");
  if (typeof locale !== "string" || !isSupportedLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });

  const redirectTo = formData.get("redirectTo");
  revalidatePath(typeof redirectTo === "string" && redirectTo.startsWith("/") ? redirectTo : "/");
}
