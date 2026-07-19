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
  onDark = false,
}: {
  currentLocale: Locale;
  switchLanguageAria?: string;
  languageAriaLabel?: string;
  size?: "default" | "large";
  onDark?: boolean;
}) {
  const pathname = usePathname();
  const isLarge = size === "large";

  const textMuted = onDark ? "text-ba-sand-deep/55" : "text-ac-espresso";
  const textActive = onDark ? "text-ba-pearl" : "text-ba-espresso";
  const textInactive = onDark
    ? "text-ba-sand-deep/70 hover:text-ba-pearl"
    : "text-ac-espresso hover:text-ba-bronze";

  return (
    <div
      className={joinClasses(
        "flex items-center gap-1 font-medium",
        onDark ? "text-ba-sand-deep/70" : "text-ac-espresso",
        isLarge ? "text-sm" : "text-xs",
      )}
      role="group"
      aria-label={languageAriaLabel}
    >
      {SUPPORTED_LOCALES.map((locale, index) => (
        <span key={locale} className="inline-flex items-center">
          {index > 0 ? (
            <span className={joinClasses("mx-1", textMuted)} aria-hidden>
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
                onDark ? dsFocus.ringDark : dsFocus.ring,
                currentLocale === locale ? textActive : textInactive,
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
