"use client";

import { createContext, useContext, useMemo } from "react";
import { translate } from "@/lib/i18n/format";
import type { Dictionary, DictionaryKey } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";

/**
 * Client-side access to the current locale's dictionary. The dictionary
 * itself is always loaded server-side (`getDictionary`, `server-only`)
 * and handed down once from the root layout via `<TranslationProvider>`
 * -- Client Components never fetch or bundle translation JSON
 * themselves, they just read it from this context.
 */
type TranslationContextValue = {
  locale: Locale;
  dictionary: Dictionary;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function TranslationProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ locale, dictionary }), [locale, dictionary]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

/** Client Component hook: `const { t, locale } = useTranslations();` then `t("nav.recipes")`. */
export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslations() must be used within <TranslationProvider> (see app/layout.tsx).");
  }

  const { locale, dictionary } = context;
  const t = (key: DictionaryKey, vars?: Record<string, string | number>) => translate(dictionary, key, vars);

  return { t, locale, dictionary };
}
