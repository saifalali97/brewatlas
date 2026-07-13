/**
 * Types for the BrewAtlas internationalization (i18n) system: supported
 * locales, the static UI dictionary shape, and the database-backed
 * content translation shapes (recipes, coffees, devices, origins,
 * brewing methods, AI-generated content).
 *
 * Deliberately split in two:
 * - "UI dictionary" strings (nav, buttons, forms, errors, ...) -- static
 *   copy shipped with the app, translated once per locale ahead of time.
 *   See `lib/i18n/dictionaries/*`.
 * - "Content" translations -- rows of user/editorial data (a recipe's
 *   title, a device's description, ...) translated per-entity, stored in
 *   the database. See `lib/data/translations.ts`.
 */

/** Every locale BrewAtlas ships with today. Adding a new language is: add one entry here + one dictionary file -- nothing else changes shape. */
export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that should render right-to-left. Everything not listed here is left-to-right. */
export const RTL_LOCALES: readonly Locale[] = ["ar"];

export type TextDirection = "ltr" | "rtl";

export type LocaleMetadata = {
  locale: Locale;
  /** Native-language display name, e.g. "العربية" for `ar`. */
  nativeName: string;
  /** English display name, e.g. "Arabic". */
  englishName: string;
  direction: TextDirection;
  /** BCP-47 tag for `<html lang>` / Open Graph `locale` / hreflang. */
  bcp47: string;
};

export const LOCALE_METADATA: Record<Locale, LocaleMetadata> = {
  en: { locale: "en", nativeName: "English", englishName: "English", direction: "ltr", bcp47: "en-US" },
  ar: { locale: "ar", nativeName: "العربية", englishName: "Arabic", direction: "rtl", bcp47: "ar" },
};

/** The cookie that persists a user's manually-chosen (or detected) locale across requests. */
export const LOCALE_COOKIE_NAME = "brewatlas_locale";

// ---------------------------------------------------------------------------
// Database-backed content translations
// ---------------------------------------------------------------------------

/** Every translatable entity kind with its own `*_translations` table (or, for editorial content, its own locale-per-row table). */
export const TRANSLATABLE_ENTITIES = [
  "recipe",
  "coffee",
  "device",
  "origin",
  "brewing_method",
  "ai_content",
] as const;
export type TranslatableEntity = (typeof TRANSLATABLE_ENTITIES)[number];

/** `public.recipe_translations` row, camelCased. Only the human-language fields of a recipe -- structural fields (ratio, temperature, ids, ...) live once on `recipes` regardless of locale. */
export type RecipeTranslation = {
  recipeId: string;
  locale: Locale;
  title: string | null;
  description: string | null;
  brewNotes: string | null;
  tastingNotes: string | null;
  tips: string | null;
  warnings: string | null;
  steps: string | null;
  aiSummary: string | null;
  isMachineTranslated: boolean;
  updatedAt: string;
};

export type DbRecipeTranslationRow = {
  recipe_id: string;
  locale: string;
  title: string | null;
  description: string | null;
  brew_notes: string | null;
  tasting_notes: string | null;
  tips: string | null;
  warnings: string | null;
  steps: string | null;
  ai_summary: string | null;
  is_machine_translated: boolean;
  updated_at: string;
};

/** Shared shape for the simpler lookup-entity translation tables (coffees, devices, origins, brewing_methods): a name + description per locale. */
export type LookupTranslation = {
  entityId: string;
  locale: Locale;
  name: string | null;
  description: string | null;
  isMachineTranslated: boolean;
  updatedAt: string;
};

export type DbLookupTranslationRow = {
  entity_id: string;
  locale: string;
  name: string | null;
  description: string | null;
  is_machine_translated: boolean;
  updated_at: string;
};

/** The lookup-entity translation tables, mapped to their FK column name on the base table. */
export const LOOKUP_TRANSLATION_TABLES: Record<"coffee" | "device" | "origin" | "brewing_method", string> = {
  coffee: "coffee_translations",
  device: "device_translations",
  origin: "origin_translations",
  brewing_method: "brewing_method_translations",
};

/**
 * Generic translation store for AI-generated content that doesn't have a
 * dedicated table of its own (recommendation "reasons", discovery
 * summaries, future AI-written recipe/tasting summaries, ...). Keyed by
 * an arbitrary `(content_type, content_id)` pair so any future AI
 * feature can start storing translations without a new migration.
 */
export type AiContentTranslation = {
  contentType: string;
  contentId: string;
  locale: Locale;
  text: string;
  sourceHash: string | null;
  isMachineTranslated: boolean;
  updatedAt: string;
};

export type DbAiContentTranslationRow = {
  content_type: string;
  content_id: string;
  locale: string;
  text: string;
  source_hash: string | null;
  is_machine_translated: boolean;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Future AI Translation (adapter pattern, no external calls -- see
// lib/i18n/translation-adapter.ts)
// ---------------------------------------------------------------------------

export type TranslationRequest = {
  text: string;
  sourceLocale: Locale;
  targetLocale: Locale;
  /** Optional hint about what's being translated (e.g. "recipe_title"), so a real provider can tune tone/length. */
  context?: string;
};

export type TranslationResult = {
  translatedText: string;
  sourceLocale: Locale;
  targetLocale: Locale;
  provider: string;
  isMachineTranslated: true;
};

export interface TranslationAdapter {
  readonly provider: string;
  translate(request: TranslationRequest): Promise<TranslationResult>;
  translateBatch(requests: TranslationRequest[]): Promise<TranslationResult[]>;
}
