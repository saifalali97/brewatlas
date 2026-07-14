"use server";

import { revalidatePath } from "next/cache";
import {
  getAiContentTranslation,
  getLookupTranslation,
  getRecipeTranslation,
  upsertAiContentTranslation,
  upsertLookupTranslation,
  upsertRecipeTranslation,
  type LookupTranslationEntity,
} from "@/lib/data/translations";
import { isSupportedLocale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import type { AiContentTranslation, LookupTranslation, RecipeTranslation } from "@/types/i18n";
import { LOOKUP_TRANSLATION_TABLES } from "@/types/i18n";

function isLookupTranslationEntity(value: string | null): value is LookupTranslationEntity {
  return !!value && value in LOOKUP_TRANSLATION_TABLES;
}

/**
 * Localization Server Actions (requirement 8 -- "Create localization
 * server actions"). Thin, `"use server"` wrappers around
 * `lib/data/translations.ts`, following the same shape as the rest of
 * `lib/supabase/*-actions.ts`: parse `FormData`, delegate to the data
 * layer (which is where RLS-relevant reads/writes actually happen),
 * revalidate, return a `{ error }` / `{ success }` state.
 */

export type TranslationActionState = { error?: string; success?: string } | undefined;

function requiredString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Saves (or updates) a recipe's translated copy for one locale. Used by a future recipe-editor "Translations" tab; RLS on `recipe_translations` restricts this to the recipe's author or an admin. */
export async function saveRecipeTranslationAction(
  _prevState: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "You must be signed in to manage recipe translations." };

  const recipeId = requiredString(formData, "recipeId");
  const locale = requiredString(formData, "locale");
  if (!recipeId) return { error: "recipeId is required." };
  if (!locale || !isSupportedLocale(locale)) return { error: "A supported locale is required." };

  const saved = await upsertRecipeTranslation(supabase, recipeId, locale, {
    title: optionalString(formData, "title"),
    description: optionalString(formData, "description"),
    brewNotes: optionalString(formData, "brewNotes"),
    tastingNotes: optionalString(formData, "tastingNotes"),
    tips: optionalString(formData, "tips"),
    warnings: optionalString(formData, "warnings"),
    steps: optionalString(formData, "steps"),
    aiSummary: optionalString(formData, "aiSummary"),
  });

  if (!saved) return { error: "Failed to save the recipe translation." };

  revalidatePath(`/recipes`);
  return { success: "Recipe translation saved." };
}

/** Reads a recipe's translation for a locale -- a plain read action (no `FormData`) for client components that need a translation on demand rather than via a Server Component fetch. */
export async function getRecipeTranslationAction(recipeId: string, locale: string): Promise<RecipeTranslation | null> {
  if (!isSupportedLocale(locale)) return null;
  const supabase = await createClient();
  return getRecipeTranslation(supabase, recipeId, locale);
}

/** Saves (or updates) a lookup entity's (coffee/device/origin/brewing method) translated display name + description for one locale. Admin-only for everything except coffees, where the original creator may also manage it (mirrors the base tables' RLS). */
export async function saveLookupTranslationAction(
  _prevState: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "You must be signed in to manage translations." };

  const entityRaw = requiredString(formData, "entity");
  const entityId = requiredString(formData, "entityId");
  const locale = requiredString(formData, "locale");
  if (!isLookupTranslationEntity(entityRaw)) {
    return { error: `entity must be one of: ${Object.keys(LOOKUP_TRANSLATION_TABLES).join(", ")}.` };
  }
  const entity = entityRaw;
  if (!entityId) return { error: "entityId is required." };
  if (!locale || !isSupportedLocale(locale)) return { error: "A supported locale is required." };

  const saved = await upsertLookupTranslation(supabase, entity, entityId, locale, {
    name: optionalString(formData, "name"),
    description: optionalString(formData, "description"),
  });

  if (!saved) return { error: "Failed to save the translation." };

  revalidatePath("/devices");
  revalidatePath("/origins");
  return { success: "Translation saved." };
}

export async function getLookupTranslationAction(
  entity: LookupTranslationEntity,
  entityId: string,
  locale: string,
): Promise<LookupTranslation | null> {
  if (!isSupportedLocale(locale)) return null;
  const supabase = await createClient();
  return getLookupTranslation(supabase, entity, entityId, locale);
}

/** Saves a translation of AI-generated content (e.g. a recommendation reason or AI taste-profile summary) for a locale. Scoped by RLS to the caller's own AI content, or an admin. See requirement 9 / `lib/i18n/translation-adapter.ts`. */
export async function saveAiContentTranslationAction(
  _prevState: TranslationActionState,
  formData: FormData,
): Promise<TranslationActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "You must be signed in to manage AI content translations." };

  const contentType = requiredString(formData, "contentType");
  const contentId = requiredString(formData, "contentId");
  const locale = requiredString(formData, "locale");
  const text = requiredString(formData, "text");
  if (!contentType) return { error: "contentType is required." };
  if (!contentId) return { error: "contentId is required." };
  if (!locale || !isSupportedLocale(locale)) return { error: "A supported locale is required." };
  if (!text) return { error: "text is required." };

  const saved = await upsertAiContentTranslation(supabase, { contentType, contentId, locale, text });
  if (!saved) return { error: "Failed to save the AI content translation." };

  return { success: "AI content translation saved." };
}

export async function getAiContentTranslationAction(
  contentType: string,
  contentId: string,
  locale: string,
): Promise<AiContentTranslation | null> {
  if (!isSupportedLocale(locale)) return null;
  const supabase = await createClient();
  return getAiContentTranslation(supabase, contentType, contentId, locale);
}
