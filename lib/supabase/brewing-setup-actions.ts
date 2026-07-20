"use server";

import { revalidatePath } from "next/cache";
import { ensureUserBrewingProfile } from "@/lib/data/brewing-setup";
import { updateTasteProfile } from "@/lib/data/ai";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { PREFERRED_UNITS_OPTIONS, type PreferredUnits } from "@/types/personal";
import {
  USER_EQUIPMENT_CATEGORIES,
  USER_EXPERIENCE_LEVELS,
  USER_SETUP_CONTEXTS,
  type BrewingSetupExport,
  type UserEquipmentCategory,
  type UserExperienceLevel,
  type UserSetupContext,
} from "@/types/brewing-setup";

export type BrewingSetupActionState = { error?: string; success?: string } | undefined;

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCategory(value: string | null): UserEquipmentCategory | null {
  return value && (USER_EQUIPMENT_CATEGORIES as readonly string[]).includes(value)
    ? (value as UserEquipmentCategory)
    : null;
}

function parseExperience(value: string | null): UserExperienceLevel | null {
  return value && (USER_EXPERIENCE_LEVELS as readonly string[]).includes(value)
    ? (value as UserExperienceLevel)
    : null;
}

function parseSetupContext(value: string | null): UserSetupContext {
  return value && (USER_SETUP_CONTEXTS as readonly string[]).includes(value)
    ? (value as UserSetupContext)
    : "home";
}

function parseOriginIds(formData: FormData): string[] {
  const raw = formData.getAll("originIds");
  return raw.map(String).filter(Boolean);
}

function parseRecipeIds(formData: FormData): string[] {
  const raw = formData.getAll("recipeIds");
  return raw.map(String).filter(Boolean);
}

async function syncLegacyCoffeeSetup(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  profileId: string,
  setup: {
    defaultGrinderItemId: string | null;
    defaultBrewerItemId: string | null;
    defaultKettleItemId: string | null;
    defaultScaleItemId: string | null;
    defaultFilterItemId: string | null;
    preferredWaterProfileId: string | null;
    preferredUnits: PreferredUnits | null;
  },
) {
  const [{ data: grinderItem }, { data: brewerItem }, { data: filterItem }, { data: xbloomItem }, { data: kettleItem }, { data: scaleItem }, { data: espressoItem }] =
    await Promise.all([
      setup.defaultGrinderItemId
        ? supabase.from("user_equipment_items").select("grinder_id").eq("id", setup.defaultGrinderItemId).maybeSingle()
        : Promise.resolve({ data: null }),
      setup.defaultBrewerItemId
        ? supabase.from("user_equipment_items").select("device_id").eq("id", setup.defaultBrewerItemId).maybeSingle()
        : Promise.resolve({ data: null }),
      setup.defaultFilterItemId
        ? supabase.from("user_equipment_items").select("filter_type_id").eq("id", setup.defaultFilterItemId).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("user_equipment_items")
        .select("xbloom_device_id")
        .eq("user_id", userId)
        .eq("category", "xbloom")
        .eq("is_default", true)
        .eq("is_retired", false)
        .limit(1)
        .maybeSingle(),
      setup.defaultKettleItemId
        ? supabase.from("user_equipment_items").select("custom_label").eq("id", setup.defaultKettleItemId).maybeSingle()
        : supabase
            .from("user_equipment_items")
            .select("custom_label")
            .eq("user_id", userId)
            .eq("category", "kettle")
            .eq("is_default", true)
            .limit(1)
            .maybeSingle(),
      setup.defaultScaleItemId
        ? supabase.from("user_equipment_items").select("custom_label").eq("id", setup.defaultScaleItemId).maybeSingle()
        : supabase
            .from("user_equipment_items")
            .select("custom_label")
            .eq("user_id", userId)
            .eq("category", "scale")
            .eq("is_default", true)
            .limit(1)
            .maybeSingle(),
      supabase
        .from("user_equipment_items")
        .select("custom_label")
        .eq("user_id", userId)
        .eq("category", "espresso_machine")
        .eq("is_default", true)
        .limit(1)
        .maybeSingle(),
    ]);

  await supabase.from("user_coffee_setups").upsert(
    {
      user_id: userId,
      grinder_id: (grinderItem?.grinder_id as string | null) ?? null,
      brewer_device_id: (brewerItem?.device_id as string | null) ?? null,
      xbloom_device_id: (xbloomItem?.xbloom_device_id as string | null) ?? null,
      filter_type_id: (filterItem?.filter_type_id as string | null) ?? null,
      kettle: (kettleItem?.custom_label as string | null) ?? null,
      scale: (scaleItem?.custom_label as string | null) ?? null,
      espresso_machine: (espressoItem?.custom_label as string | null) ?? null,
      preferred_water_profile_id: setup.preferredWaterProfileId,
      preferred_units: setup.preferredUnits,
    },
    { onConflict: "user_id" },
  );

  if (brewerItem?.device_id) {
    await supabase.from("profiles").update({ favorite_device_id: brewerItem.device_id as string }).eq("id", userId);
  }
  if (grinderItem?.grinder_id) {
    await supabase.from("profiles").update({ favorite_grinder_id: grinderItem.grinder_id as string }).eq("id", userId);
  }

  void profileId;
}

function revalidateSetupPaths() {
  revalidatePath("/account");
  revalidatePath("/account/setup");
  revalidatePath("/account/coffee-setup");
  revalidatePath("/ai-coach");
}

export async function saveBrewingProfileAction(
  _prev: BrewingSetupActionState,
  formData: FormData,
): Promise<BrewingSetupActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewingSetupPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  try {
    const profile = await ensureUserBrewingProfile(supabase, authData.user.id);
    const preferredUnitsRaw = optionalString(formData, "preferredUnits");
    const preferredUnits =
      preferredUnitsRaw && (PREFERRED_UNITS_OPTIONS as readonly string[]).includes(preferredUnitsRaw)
        ? (preferredUnitsRaw as PreferredUnits)
        : null;

    const payload = {
      experience_level: parseExperience(optionalString(formData, "experienceLevel")),
      setup_context: parseSetupContext(optionalString(formData, "setupContext")),
      favorite_roast_level: optionalString(formData, "favoriteRoastLevel"),
      favorite_processing: optionalString(formData, "favoriteProcessing"),
      favorite_brew_ratio: optionalString(formData, "favoriteBrewRatio"),
      favorite_temperature_c: parseNumber(optionalString(formData, "favoriteTemperatureC")),
      preferred_units: preferredUnits,
      preferred_water_profile_id: optionalString(formData, "preferredWaterProfileId"),
      favorite_brewing_method_id: optionalString(formData, "favoriteBrewingMethodId"),
      default_brewer_item_id: optionalString(formData, "defaultBrewerItemId"),
      default_grinder_item_id: optionalString(formData, "defaultGrinderItemId"),
      default_kettle_item_id: optionalString(formData, "defaultKettleItemId"),
      default_scale_item_id: optionalString(formData, "defaultScaleItemId"),
      default_filter_item_id: optionalString(formData, "defaultFilterItemId"),
      notes: optionalString(formData, "notes"),
    };

    const { error } = await supabase.from("user_brewing_profiles").update(payload).eq("id", profile.id);
    if (error) return { error: error.message || labels.saveFailed };

    await supabase.from("user_brewing_profile_origins").delete().eq("profile_id", profile.id);
    const originIds = parseOriginIds(formData);
    if (originIds.length > 0) {
      await supabase.from("user_brewing_profile_origins").insert(
        originIds.map((originId) => ({ profile_id: profile.id, origin_id: originId })),
      );
    }

    await supabase.from("user_brewing_profile_recipes").delete().eq("profile_id", profile.id);
    const recipeIds = parseRecipeIds(formData);
    if (recipeIds.length > 0) {
      await supabase.from("user_brewing_profile_recipes").insert(
        recipeIds.map((recipeId) => ({ profile_id: profile.id, recipe_id: recipeId })),
      );
    }

    await syncLegacyCoffeeSetup(supabase, authData.user.id, profile.id, {
      defaultGrinderItemId: payload.default_grinder_item_id,
      defaultBrewerItemId: payload.default_brewer_item_id,
      defaultKettleItemId: payload.default_kettle_item_id,
      defaultScaleItemId: payload.default_scale_item_id,
      defaultFilterItemId: payload.default_filter_item_id,
      preferredWaterProfileId: payload.preferred_water_profile_id,
      preferredUnits,
    });

    await updateTasteProfile(supabase, authData.user.id);
    revalidateSetupPaths();
    return { success: labels.profileSaved };
  } catch (error) {
    return { error: error instanceof Error ? error.message : labels.saveFailed };
  }
}

export async function saveEquipmentItemAction(
  _prev: BrewingSetupActionState,
  formData: FormData,
): Promise<BrewingSetupActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewingSetupPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const category = parseCategory(optionalString(formData, "category"));
  if (!category) return { error: labels.invalidCategory };

  const itemId = optionalString(formData, "itemId");
  const isDefault = formData.get("isDefault") === "1";
  const isFavorite = formData.get("isFavorite") === "1";
  const isRetired = formData.get("isRetired") === "1";

  const payload = {
    user_id: authData.user.id,
    category,
    device_id: category === "brewer" ? optionalString(formData, "deviceId") : null,
    grinder_id: category === "grinder" ? optionalString(formData, "grinderId") : null,
    filter_type_id: category === "filter" ? optionalString(formData, "filterTypeId") : null,
    xbloom_device_id: category === "xbloom" ? optionalString(formData, "xbloomDeviceId") : null,
    custom_label:
      category === "kettle" || category === "scale" || category === "espresso_machine" || category === "other"
        ? optionalString(formData, "customLabel")
        : null,
    notes: optionalString(formData, "notes"),
    is_default: isDefault,
    is_favorite: isFavorite,
    is_retired: isRetired,
    sort_order: Number.parseInt(optionalString(formData, "sortOrder") ?? "0", 10) || 0,
  };

  let savedId = itemId;
  if (itemId) {
    const { error } = await supabase.from("user_equipment_items").update(payload).eq("id", itemId).eq("user_id", authData.user.id);
    if (error) return { error: error.message || labels.saveFailed };
  } else {
    const { data, error } = await supabase.from("user_equipment_items").insert(payload).select("id").single();
    if (error || !data) return { error: error?.message || labels.saveFailed };
    savedId = data.id as string;
  }

  if (isDefault && savedId) {
    const profile = await ensureUserBrewingProfile(supabase, authData.user.id);
    const defaultField =
      category === "brewer"
        ? "default_brewer_item_id"
        : category === "grinder"
          ? "default_grinder_item_id"
          : category === "kettle"
            ? "default_kettle_item_id"
            : category === "scale"
              ? "default_scale_item_id"
              : category === "filter"
                ? "default_filter_item_id"
                : null;

    if (defaultField) {
      await supabase.from("user_brewing_profiles").update({ [defaultField]: savedId }).eq("id", profile.id);
    }

    await supabase
      .from("user_equipment_items")
      .update({ is_default: false })
      .eq("user_id", authData.user.id)
      .eq("category", category)
      .neq("id", savedId);
  }

  await updateTasteProfile(supabase, authData.user.id);
  revalidateSetupPaths();
  return { success: labels.equipmentSaved };
}

export async function deleteEquipmentItemAction(
  _prev: BrewingSetupActionState,
  formData: FormData,
): Promise<BrewingSetupActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewingSetupPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const itemId = optionalString(formData, "itemId");
  if (!itemId) return { error: labels.saveFailed };

  const { error } = await supabase.from("user_equipment_items").delete().eq("id", itemId).eq("user_id", authData.user.id);
  if (error) return { error: error.message || labels.saveFailed };

  await updateTasteProfile(supabase, authData.user.id);
  revalidateSetupPaths();
  return { success: labels.equipmentDeleted };
}

export async function importBrewingSetupAction(
  _prev: BrewingSetupActionState,
  formData: FormData,
): Promise<BrewingSetupActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.brewingSetupPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const raw = optionalString(formData, "importJson");
  if (!raw) return { error: labels.importInvalid };

  let parsed: BrewingSetupExport;
  try {
    parsed = JSON.parse(raw) as BrewingSetupExport;
    if (parsed.version !== 1 || !parsed.profile || !Array.isArray(parsed.equipment)) {
      throw new Error("Invalid export shape");
    }
  } catch {
    return { error: labels.importInvalid };
  }

  const profile = await ensureUserBrewingProfile(supabase, authData.user.id);
  await supabase
    .from("user_brewing_profiles")
    .update({
      experience_level: parsed.profile.experienceLevel,
      setup_context: parsed.profile.setupContext ?? "home",
      favorite_roast_level: parsed.profile.favoriteRoastLevel,
      favorite_processing: parsed.profile.favoriteProcessing,
      favorite_brew_ratio: parsed.profile.favoriteBrewRatio,
      favorite_temperature_c: parsed.profile.favoriteTemperatureC,
      preferred_units: parsed.profile.preferredUnits,
      preferred_water_profile_id: parsed.profile.preferredWaterProfileId,
      favorite_brewing_method_id: parsed.profile.favoriteBrewingMethodId,
      notes: parsed.profile.notes,
    })
    .eq("id", profile.id);

  await supabase.from("user_equipment_items").delete().eq("user_id", authData.user.id);
  if (parsed.equipment.length > 0) {
    await supabase.from("user_equipment_items").insert(
      parsed.equipment.map((item) => ({
        user_id: authData.user.id,
        category: item.category,
        device_id: item.deviceId,
        grinder_id: item.grinderId,
        filter_type_id: item.filterTypeId,
        xbloom_device_id: item.xbloomDeviceId,
        custom_label: item.customLabel,
        notes: item.notes,
        is_default: item.isDefault,
        is_favorite: item.isFavorite,
        is_retired: item.isRetired,
        sort_order: item.sortOrder,
      })),
    );
  }

  await updateTasteProfile(supabase, authData.user.id);
  revalidateSetupPaths();
  return { success: labels.importSuccess };
}
