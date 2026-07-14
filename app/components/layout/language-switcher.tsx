"use client";

import { usePathname } from "next/navigation";
import { setLocaleAction } from "@/lib/i18n/actions";
import { LOCALE_METADATA, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import type { Locale } from "@/types/i18n";

/**
 * Manual language switch (requirement: "Saved user preference" +
 * "Manual language switch"). Deliberately minimal -- a same-size text
 * toggle dropped into the existing nav, not a new visual element -- per
 * "DO NOT redesign the UI". Submits `setLocaleAction`, a plain Server
 * Action, so it works even without client-side JS.
 *
 * Renders one button per `SUPPORTED_LOCALES` entry automatically, so
 * adding a third language later needs no changes here.
 */
export function LanguageSwitcher({
  currentLocale,
  switchLanguageAria = "Switch to {language}",
  languageAriaLabel = "Language",
}: {
  currentLocale: Locale;
  /** Translated `"Switch to {language}"` template -- `{language}` is interpolated with each locale's native name. */
  switchLanguageAria?: string;
  languageAriaLabel?: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-xs font-medium text-stone-400" aria-label={languageAriaLabel}>
      {SUPPORTED_LOCALES.map((locale) => (
        <form key={locale} action={setLocaleAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="redirectTo" value={pathname} />
          <button
            type="submit"
            aria-current={currentLocale === locale ? "true" : undefined}
            aria-label={switchLanguageAria.replace("{language}", LOCALE_METADATA[locale].nativeName)}
            className={`rounded-full px-1.5 py-1 uppercase tracking-wide transition-colors duration-300 ${
              currentLocale === locale ? "text-stone-100" : "hover:text-stone-100"
            }`}
          >
            {locale}
          </button>
        </form>
      ))}
    </div>
  );
}
