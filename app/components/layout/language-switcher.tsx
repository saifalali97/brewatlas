"use client";

import { usePathname } from "next/navigation";
import { setLocaleAction } from "@/lib/i18n/actions";
import { LOCALE_METADATA, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { dsFocus, dsMotion } from "@/lib/constants/styles";
import type { Locale } from "@/types/i18n";

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Manual language switch — submits `setLocaleAction` so it works without JS.
 */
export function LanguageSwitcher({
  currentLocale,
  switchLanguageAria = "Switch to {language}",
  languageAriaLabel = "Language",
  size = "default",
}: {
  currentLocale: Locale;
  switchLanguageAria?: string;
  languageAriaLabel?: string;
  size?: "default" | "large";
}) {
  const pathname = usePathname();
  const isLarge = size === "large";

  return (
    <div
      className={joinClasses(
        "flex items-center gap-1 font-medium text-stone-400",
        isLarge ? "text-sm" : "text-xs",
      )}
      role="group"
      aria-label={languageAriaLabel}
    >
      {SUPPORTED_LOCALES.map((locale, index) => (
        <span key={locale} className="inline-flex items-center">
          {index > 0 ? (
            <span className="mx-1 text-stone-600" aria-hidden>
              /
            </span>
          ) : null}
          <form action={setLocaleAction} className="inline">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="redirectTo" value={pathname} />
            <button
              type="submit"
              aria-current={currentLocale === locale ? "true" : undefined}
              aria-label={switchLanguageAria.replace("{language}", LOCALE_METADATA[locale].nativeName)}
              className={joinClasses(
                "min-h-11 min-w-[2.75rem] rounded-full px-2 uppercase tracking-wide",
                dsMotion.transition,
                dsFocus.ring,
                currentLocale === locale
                  ? "text-uae-pearl"
                  : "text-stone-500 hover:text-uae-pearl",
              )}
            >
              {locale}
            </button>
          </form>
        </span>
      ))}
    </div>
  );
}
