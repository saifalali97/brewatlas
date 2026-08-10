import type { SupabaseClient } from "@supabase/supabase-js";
import { optionalString } from "@/lib/forms/form-fields";
import type { OfficialRecipeFaqItem, RecipeKind, RecipeVerificationStatus } from "@/types/official-recipe";
import { RECIPE_KINDS, RECIPE_VERIFICATION_STATUSES } from "@/types/official-recipe";

export type OfficialRecipeFormValues = {
  recipeKind: RecipeKind;
  verificationStatus: RecipeVerificationStatus;
  versionLabel: string;
  recipeScience: string | null;
  whyItWorks: string | null;
  commonMistakes: string | null;
  adjustments: string | null;
  faq: OfficialRecipeFaqItem[];
  pourStructure: string | null;
  finishNotes: string | null;
  grinderRecommendation: string | null;
  waterRecommendation: string | null;
  equipmentNotes: string | null;
  versionChangeReason: string | null;
  versionBrewingChanges: string | null;
  personalizationEnabled: boolean;
  personalizationHotSupported: boolean;
  personalizationIcedSupported: boolean;
  personalizationIcedWaterPercentage: number;
  personalizationDoseScalable: boolean;
  personalizationRatioScalable: boolean;
  personalizationPoursScalable: boolean;
};

function parseBoolSelect(formData: FormData, key: string, fallback = true): boolean {
  const value = formData.get(key);
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function parseIcedPercentage(formData: FormData): number {
  const raw = Number(formData.get("personalizationIcedWaterPercentage"));
  if (!Number.isFinite(raw)) return 50;
  return Math.min(100, Math.max(0, raw));
}

function parseKind(value: string | null): RecipeKind {
  if (value && (RECIPE_KINDS as readonly string[]).includes(value)) {
    return value as RecipeKind;
  }
  return "official";
}

function parseVerification(value: string | null): RecipeVerificationStatus {
  if (value && (RECIPE_VERIFICATION_STATUSES as readonly string[]).includes(value)) {
    return value as RecipeVerificationStatus;
  }
  return "draft";
}

function parseFaq(formData: FormData): OfficialRecipeFaqItem[] {
  const count = Number(formData.get("faqCount") ?? 0);
  const items: OfficialRecipeFaqItem[] = [];
  for (let i = 0; i < count && i < 20; i += 1) {
    const question = optionalString(formData, `faqQuestion_${i}`);
    const answer = optionalString(formData, `faqAnswer_${i}`);
    if (question && answer) items.push({ question, answer });
  }
  return items;
}

export function parseOfficialRecipeForm(formData: FormData): OfficialRecipeFormValues {
  return {
    recipeKind: parseKind(optionalString(formData, "recipeKind")),
    verificationStatus: parseVerification(optionalString(formData, "verificationStatus")),
    versionLabel: optionalString(formData, "versionLabel") ?? "1.0",
    recipeScience: optionalString(formData, "recipeScience"),
    whyItWorks: optionalString(formData, "whyItWorks"),
    commonMistakes: optionalString(formData, "commonMistakes"),
    adjustments: optionalString(formData, "adjustments"),
    faq: parseFaq(formData),
    pourStructure: optionalString(formData, "pourStructure"),
    finishNotes: optionalString(formData, "finishNotes"),
    grinderRecommendation: optionalString(formData, "grinderRecommendation"),
    waterRecommendation: optionalString(formData, "waterRecommendation"),
    equipmentNotes: optionalString(formData, "equipmentNotes"),
    versionChangeReason: optionalString(formData, "versionChangeReason"),
    versionBrewingChanges: optionalString(formData, "versionBrewingChanges"),
    personalizationEnabled: parseBoolSelect(formData, "personalizationEnabled", true),
    personalizationHotSupported: parseBoolSelect(formData, "personalizationHotSupported", true),
    personalizationIcedSupported: parseBoolSelect(formData, "personalizationIcedSupported", true),
    personalizationIcedWaterPercentage: parseIcedPercentage(formData),
    personalizationDoseScalable: parseBoolSelect(formData, "personalizationDoseScalable", true),
    personalizationRatioScalable: parseBoolSelect(formData, "personalizationRatioScalable", true),
    personalizationPoursScalable: parseBoolSelect(formData, "personalizationPoursScalable", true),
  };
}

export function officialRecipePayload(values: OfficialRecipeFormValues): Record<string, unknown> {
  return {
    recipe_kind: values.recipeKind,
    verification_status: values.verificationStatus,
    version_label: values.versionLabel,
    recipe_science: values.recipeScience,
    why_it_works: values.whyItWorks,
    common_mistakes: values.commonMistakes,
    adjustments: values.adjustments,
    faq: values.faq,
    pour_structure: values.pourStructure,
    finish_notes: values.finishNotes,
    grinder_recommendation: values.grinderRecommendation,
    water_recommendation: values.waterRecommendation,
    equipment_notes: values.equipmentNotes,
    personalization_enabled: values.personalizationEnabled,
    personalization_hot_supported: values.personalizationHotSupported,
    personalization_iced_supported: values.personalizationIcedSupported,
    personalization_iced_water_percentage: values.personalizationIcedWaterPercentage,
    personalization_dose_scalable: values.personalizationDoseScalable,
    personalization_ratio_scalable: values.personalizationRatioScalable,
    personalization_pours_scalable: values.personalizationPoursScalable,
  };
}

export async function verifyOfficialRecipe(
  supabase: SupabaseClient,
  recipeId: string,
  verifierId: string,
  status: RecipeVerificationStatus = "verified",
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("recipes")
    .update({
      verification_status: status,
      verified_at: new Date().toISOString(),
      verified_by: verifierId,
      recipe_kind: status === "archived" ? "archived" : "official",
    })
    .eq("id", recipeId);

  if (error) return { error: error.message };
  return {};
}

/** Duplicates any recipe kind into a draft, copying Gulf children + translations. */
export async function duplicateRecipe(
  supabase: SupabaseClient,
  recipeId: string,
  authorId: string,
): Promise<{ id?: string; error?: string }> {
  const { data: source, error: fetchError } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", recipeId)
    .maybeSingle();

  if (fetchError || !source) {
    return { error: fetchError?.message ?? "Recipe not found." };
  }

  const baseSlug = `${source.slug as string}-copy`;
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const rest = { ...(source as Record<string, unknown>) };
  delete rest.id;
  delete rest.created_at;
  delete rest.updated_at;
  delete rest.slug;
  delete rest.deleted_at;
  delete rest.preview_token;
  delete rest.preview_token_expires_at;
  delete rest.archived_at;

  const { data: inserted, error } = await supabase
    .from("recipes")
    .insert({
      ...rest,
      slug,
      title: `${source.title as string} (Copy)`,
      author_id: authorId,
      status: "draft",
      published: false,
      featured: false,
      verification_status: "draft",
      verified_at: null,
      verified_by: null,
      deleted_at: null,
      preview_token: null,
      preview_token_expires_at: null,
      scheduled_publish_at: null,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Duplicate failed." };

  const newId = inserted.id as string;

  const [{ data: pours }, { data: tags }, { data: images }] = await Promise.all([
    supabase.from("recipe_pours").select("*").eq("recipe_id", recipeId),
    supabase.from("recipe_tags").select("tag_id").eq("recipe_id", recipeId),
    supabase.from("recipe_images").select("*").eq("recipe_id", recipeId).order("sort_order"),
  ]);

  if (pours?.length) {
    await supabase.from("recipe_pours").insert(
      pours.map((pour) => {
        const row = { ...(pour as Record<string, unknown>) };
        delete row.id;
        delete row.created_at;
        row.recipe_id = newId;
        return row;
      }),
    );
  }

  if (tags?.length) {
    await supabase.from("recipe_tags").insert(
      tags.map((tag) => ({
        recipe_id: newId,
        tag_id: tag.tag_id,
      })),
    );
  }

  if (images?.length) {
    await supabase.from("recipe_images").insert(
      images.map((image) => {
        const row = { ...(image as Record<string, unknown>) };
        delete row.id;
        delete row.created_at;
        row.recipe_id = newId;
        return row;
      }),
    );
  }

  return { id: newId };
}

/** @deprecated Use duplicateRecipe — kept for existing imports. */
export async function duplicateOfficialRecipe(
  supabase: SupabaseClient,
  recipeId: string,
  authorId: string,
): Promise<{ id?: string; error?: string }> {
  return duplicateRecipe(supabase, recipeId, authorId);
}
