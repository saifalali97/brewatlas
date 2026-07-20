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
};

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

export async function duplicateOfficialRecipe(
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

  const { data: inserted, error } = await supabase
    .from("recipes")
    .insert({
      ...rest,
      slug,
      title: `${source.title as string} (Copy)`,
      author_id: authorId,
      status: "draft",
      published: false,
      verification_status: "draft",
      verified_at: null,
      verified_by: null,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Duplicate failed." };
  return { id: inserted.id as string };
}
