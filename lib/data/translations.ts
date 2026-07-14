import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import type {
  AiContentTranslation,
  DbAiContentTranslationRow,
  DbLookupTranslationRow,
  DbRecipeTranslationRow,
  Locale,
  LookupTranslation,
  RecipeTranslation,
} from "@/types/i18n";
import { LOOKUP_TRANSLATION_TABLES } from "@/types/i18n";
import type { RecipeFullDetail } from "@/types/recipe";

/**
 * Data-access layer for database-backed content translations (Recipe
 * Localization + the lookup/AI-content translation tables -- see
 * requirements 3 & 4). Mirrors the read/write shape of the rest of
 * `lib/data/*`: plain functions taking a `SupabaseClient` first, RLS
 * enforces who can write, camelCased return types.
 */

const RECIPE_TRANSLATION_FIELDS =
  "recipe_id, locale, title, description, brew_notes, tasting_notes, tips, warnings, steps, ai_summary, is_machine_translated, updated_at";
const LOOKUP_TRANSLATION_FIELDS = "entity_id, locale, name, description, is_machine_translated, updated_at";
const AI_CONTENT_TRANSLATION_FIELDS =
  "content_type, content_id, locale, text, source_hash, is_machine_translated, updated_at";

function mapRecipeTranslation(row: DbRecipeTranslationRow): RecipeTranslation {
  return {
    recipeId: row.recipe_id,
    locale: row.locale as Locale,
    title: row.title,
    description: row.description,
    brewNotes: row.brew_notes,
    tastingNotes: row.tasting_notes,
    tips: row.tips,
    warnings: row.warnings,
    steps: row.steps,
    aiSummary: row.ai_summary,
    isMachineTranslated: row.is_machine_translated,
    updatedAt: row.updated_at,
  };
}

function mapLookupTranslation(row: DbLookupTranslationRow): LookupTranslation {
  return {
    entityId: row.entity_id,
    locale: row.locale as Locale,
    name: row.name,
    description: row.description,
    isMachineTranslated: row.is_machine_translated,
    updatedAt: row.updated_at,
  };
}

function mapAiContentTranslation(row: DbAiContentTranslationRow): AiContentTranslation {
  return {
    contentType: row.content_type,
    contentId: row.content_id,
    locale: row.locale as Locale,
    text: row.text,
    sourceHash: row.source_hash,
    isMachineTranslated: row.is_machine_translated,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// Recipe translations
// ---------------------------------------------------------------------------

/** The translated fields for one recipe in one locale, or `null` if it hasn't been translated yet (the caller should fall back to the recipe's own English fields -- see `localizeRecipe`). */
export async function getRecipeTranslation(
  supabase: SupabaseClient,
  recipeId: string,
  locale: Locale,
): Promise<RecipeTranslation | null> {
  if (locale === DEFAULT_LOCALE) return null;

  const { data, error } = await supabase
    .from("recipe_translations")
    .select(RECIPE_TRANSLATION_FIELDS)
    .eq("recipe_id", recipeId)
    .eq("locale", locale)
    .maybeSingle();

  if (error || !data) return null;
  return mapRecipeTranslation(data as DbRecipeTranslationRow);
}

export type RecipeTranslationInput = Partial<
  Pick<RecipeTranslation, "title" | "description" | "brewNotes" | "tastingNotes" | "tips" | "warnings" | "steps" | "aiSummary">
> & { isMachineTranslated?: boolean };

/** Creates or updates the translation row for a recipe/locale pair (author/admin RLS on `recipe_translations` governs who may call this). */
export async function upsertRecipeTranslation(
  supabase: SupabaseClient,
  recipeId: string,
  locale: Locale,
  fields: RecipeTranslationInput,
): Promise<RecipeTranslation | null> {
  const { data, error } = await supabase
    .from("recipe_translations")
    .upsert(
      {
        recipe_id: recipeId,
        locale,
        title: fields.title,
        description: fields.description,
        brew_notes: fields.brewNotes,
        tasting_notes: fields.tastingNotes,
        tips: fields.tips,
        warnings: fields.warnings,
        steps: fields.steps,
        ai_summary: fields.aiSummary,
        is_machine_translated: fields.isMachineTranslated ?? false,
      },
      { onConflict: "recipe_id,locale" },
    )
    .select(RECIPE_TRANSLATION_FIELDS)
    .maybeSingle();

  if (error || !data) {
    console.error("upsertRecipeTranslation failed", error);
    return null;
  }
  return mapRecipeTranslation(data as DbRecipeTranslationRow);
}

/** Extra recipe fields Recipe Localization supports that have no English column on `recipes` yet (brew notes, tips, warnings, AI summary) -- always sourced from the translation row, `null` in the default locale until one exists. */
export type LocalizedRecipeExtras = {
  brewNotes: string | null;
  tips: string | null;
  warnings: string | null;
  aiSummary: string | null;
  isMachineTranslated: boolean;
};

/**
 * Overlays a `RecipeTranslation` onto a canonical `RecipeFullDetail`:
 * any translated field that is present (`title`, `description`,
 * `tastingNotes`, `steps` -> `instructions`) replaces the English
 * value; missing/`null` translated fields fall back to the English
 * value so a partially-translated recipe never shows a blank field.
 */
export function localizeRecipe(
  recipe: RecipeFullDetail,
  translation: RecipeTranslation | null,
): RecipeFullDetail & LocalizedRecipeExtras {
  if (!translation) {
    return { ...recipe, brewNotes: null, tips: null, warnings: null, aiSummary: null, isMachineTranslated: false };
  }

  return {
    ...recipe,
    title: translation.title ?? recipe.title,
    description: translation.description ?? recipe.description,
    tastingNotes: translation.tastingNotes ?? recipe.tastingNotes,
    instructions: translation.steps ?? recipe.instructions,
    brewNotes: translation.brewNotes,
    tips: translation.tips,
    warnings: translation.warnings,
    aiSummary: translation.aiSummary,
    isMachineTranslated: translation.isMachineTranslated,
  };
}

// ---------------------------------------------------------------------------
// Lookup-entity translations (coffees, devices, origins, brewing methods)
// ---------------------------------------------------------------------------

export type LookupTranslationEntity = keyof typeof LOOKUP_TRANSLATION_TABLES;

export async function getLookupTranslation(
  supabase: SupabaseClient,
  entity: LookupTranslationEntity,
  entityId: string,
  locale: Locale,
): Promise<LookupTranslation | null> {
  if (locale === DEFAULT_LOCALE) return null;

  const { data, error } = await supabase
    .from(LOOKUP_TRANSLATION_TABLES[entity])
    .select(LOOKUP_TRANSLATION_FIELDS)
    .eq("entity_id", entityId)
    .eq("locale", locale)
    .maybeSingle();

  if (error || !data) return null;
  return mapLookupTranslation(data as DbLookupTranslationRow);
}

/** Batched variant of `getLookupTranslation` for listing pages (e.g. `/devices`, `/origins`) that render many rows at once. Returns a `Map` keyed by `entityId` for O(1) lookups while rendering. */
export async function getLookupTranslations(
  supabase: SupabaseClient,
  entity: LookupTranslationEntity,
  entityIds: string[],
  locale: Locale,
): Promise<Map<string, LookupTranslation>> {
  const result = new Map<string, LookupTranslation>();
  if (locale === DEFAULT_LOCALE || entityIds.length === 0) return result;

  const { data, error } = await supabase
    .from(LOOKUP_TRANSLATION_TABLES[entity])
    .select(LOOKUP_TRANSLATION_FIELDS)
    .in("entity_id", entityIds)
    .eq("locale", locale);

  if (error || !data) return result;
  for (const row of data as DbLookupTranslationRow[]) {
    result.set(row.entity_id, mapLookupTranslation(row));
  }
  return result;
}

export async function upsertLookupTranslation(
  supabase: SupabaseClient,
  entity: LookupTranslationEntity,
  entityId: string,
  locale: Locale,
  fields: { name?: string | null; description?: string | null; isMachineTranslated?: boolean },
): Promise<LookupTranslation | null> {
  const { data, error } = await supabase
    .from(LOOKUP_TRANSLATION_TABLES[entity])
    .upsert(
      {
        entity_id: entityId,
        locale,
        name: fields.name,
        description: fields.description,
        is_machine_translated: fields.isMachineTranslated ?? false,
      },
      { onConflict: "entity_id,locale" },
    )
    .select(LOOKUP_TRANSLATION_FIELDS)
    .maybeSingle();

  if (error || !data) {
    console.error(`upsertLookupTranslation(${entity}) failed`, error);
    return null;
  }
  return mapLookupTranslation(data as DbLookupTranslationRow);
}

/** Applies a `LookupTranslation` to a generic `{ name, description }` pair, falling back to the English values for any missing field. */
export function localizeLookupName(
  fallback: { name: string; description?: string | null },
  translation: LookupTranslation | null,
): { name: string; description: string | null } {
  if (!translation) return { name: fallback.name, description: fallback.description ?? null };
  return {
    name: translation.name ?? fallback.name,
    description: translation.description ?? fallback.description ?? null,
  };
}

// ---------------------------------------------------------------------------
// Generic AI content translations
// ---------------------------------------------------------------------------

export async function getAiContentTranslation(
  supabase: SupabaseClient,
  contentType: string,
  contentId: string,
  locale: Locale,
): Promise<AiContentTranslation | null> {
  if (locale === DEFAULT_LOCALE) return null;

  const { data, error } = await supabase
    .from("ai_content_translations")
    .select(AI_CONTENT_TRANSLATION_FIELDS)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("locale", locale)
    .maybeSingle();

  if (error || !data) return null;
  return mapAiContentTranslation(data as DbAiContentTranslationRow);
}

export async function upsertAiContentTranslation(
  supabase: SupabaseClient,
  input: { contentType: string; contentId: string; locale: Locale; text: string; sourceHash?: string | null; isMachineTranslated?: boolean },
): Promise<AiContentTranslation | null> {
  const { data, error } = await supabase
    .from("ai_content_translations")
    .upsert(
      {
        content_type: input.contentType,
        content_id: input.contentId,
        locale: input.locale,
        text: input.text,
        source_hash: input.sourceHash ?? null,
        is_machine_translated: input.isMachineTranslated ?? false,
      },
      { onConflict: "content_type,content_id,locale" },
    )
    .select(AI_CONTENT_TRANSLATION_FIELDS)
    .maybeSingle();

  if (error || !data) {
    console.error("upsertAiContentTranslation failed", error);
    return null;
  }
  return mapAiContentTranslation(data as DbAiContentTranslationRow);
}
