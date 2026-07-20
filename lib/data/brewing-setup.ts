import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminEquipmentStat,
  DbUserBrewingProfileRow,
  DbUserEquipmentItemRow,
  UserBrewingProfile,
  UserBrewingSetup,
  UserEquipmentCategory,
  UserEquipmentItem,
} from "@/types/brewing-setup";

const EQUIPMENT_SELECT = `
  id, user_id, category, device_id, grinder_id, filter_type_id, xbloom_device_id,
  custom_label, notes, is_default, is_favorite, is_retired, sort_order, created_at, updated_at,
  devices ( id, name ),
  grinders ( id, name ),
  filter_types ( id, name ),
  xbloom_devices ( id, name )
`;

const PROFILE_SELECT = `
  id, user_id, experience_level, setup_context, favorite_roast_level, favorite_processing,
  favorite_brew_ratio, favorite_temperature_c, preferred_units, preferred_water_profile_id,
  favorite_brewing_method_id, default_brewer_item_id, default_grinder_item_id,
  default_kettle_item_id, default_scale_item_id, default_filter_item_id, notes,
  created_at, updated_at,
  water_profiles ( id, name ),
  brewing_methods ( id, name ),
  user_brewing_profile_origins ( origin_id, origins ( id, country, region ) ),
  user_brewing_profile_recipes ( recipe_id )
`;

function equipmentDisplayName(row: DbUserEquipmentItemRow): string {
  return (
    row.devices?.name ??
    row.grinders?.name ??
    row.filter_types?.name ??
    row.xbloom_devices?.name ??
    row.custom_label ??
    "Unnamed"
  );
}

function mapEquipmentRow(row: DbUserEquipmentItemRow): UserEquipmentItem {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    deviceId: row.device_id,
    deviceName: row.devices?.name ?? null,
    grinderId: row.grinder_id,
    grinderName: row.grinders?.name ?? null,
    filterTypeId: row.filter_type_id,
    filterTypeName: row.filter_types?.name ?? null,
    xbloomDeviceId: row.xbloom_device_id,
    xbloomDeviceName: row.xbloom_devices?.name ?? null,
    customLabel: row.custom_label,
    displayName: equipmentDisplayName(row),
    notes: row.notes,
    isDefault: row.is_default,
    isFavorite: row.is_favorite,
    isRetired: row.is_retired,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProfileRow(row: DbUserBrewingProfileRow): UserBrewingProfile {
  const origins = row.user_brewing_profile_origins ?? [];
  return {
    id: row.id,
    userId: row.user_id,
    experienceLevel: row.experience_level,
    setupContext: row.setup_context,
    favoriteRoastLevel: row.favorite_roast_level,
    favoriteProcessing: row.favorite_processing,
    favoriteBrewRatio: row.favorite_brew_ratio,
    favoriteTemperatureC: row.favorite_temperature_c,
    preferredUnits: row.preferred_units,
    preferredWaterProfileId: row.preferred_water_profile_id,
    preferredWaterProfileName: row.water_profiles?.name ?? null,
    favoriteBrewingMethodId: row.favorite_brewing_method_id,
    favoriteBrewingMethodName: row.brewing_methods?.name ?? null,
    defaultBrewerItemId: row.default_brewer_item_id,
    defaultGrinderItemId: row.default_grinder_item_id,
    defaultKettleItemId: row.default_kettle_item_id,
    defaultScaleItemId: row.default_scale_item_id,
    defaultFilterItemId: row.default_filter_item_id,
    favoriteOriginIds: origins.map((entry) => entry.origin_id),
    favoriteOriginLabels: origins
      .map((entry) => {
        const origin = entry.origins;
        return origin ? `${origin.region}, ${origin.country}` : null;
      })
      .filter((label): label is string => Boolean(label)),
    favoriteRecipeIds: (row.user_brewing_profile_recipes ?? []).map((entry) => entry.recipe_id),
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserBrewingSetup(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserBrewingSetup> {
  const [{ data: profileData }, { data: equipmentData }] = await Promise.all([
    supabase.from("user_brewing_profiles").select(PROFILE_SELECT).eq("user_id", userId).maybeSingle(),
    supabase
      .from("user_equipment_items")
      .select(EQUIPMENT_SELECT)
      .eq("user_id", userId)
      .order("is_retired", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  return {
    profile: profileData ? mapProfileRow(profileData as unknown as DbUserBrewingProfileRow) : null,
    equipment: ((equipmentData ?? []) as unknown as DbUserEquipmentItemRow[]).map(mapEquipmentRow),
  };
}

export async function ensureUserBrewingProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserBrewingProfile> {
  const existing = await getUserBrewingSetup(supabase, userId);
  if (existing.profile) return existing.profile;

  const { data, error } = await supabase
    .from("user_brewing_profiles")
    .insert({ user_id: userId })
    .select(PROFILE_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create brewing profile.");
  }

  return mapProfileRow(data as unknown as DbUserBrewingProfileRow);
}

export function getDefaultEquipmentItem(
  setup: UserBrewingSetup,
  category: UserEquipmentCategory,
): UserEquipmentItem | null {
  const profile = setup.profile;
  const defaultId =
    category === "brewer"
      ? profile?.defaultBrewerItemId
      : category === "grinder"
        ? profile?.defaultGrinderItemId
        : category === "kettle"
          ? profile?.defaultKettleItemId
          : category === "scale"
            ? profile?.defaultScaleItemId
            : category === "filter"
              ? profile?.defaultFilterItemId
              : null;

  const active = setup.equipment.filter((item) => !item.isRetired && item.category === category);
  if (defaultId) {
    const match = active.find((item) => item.id === defaultId);
    if (match) return match;
  }
  return active.find((item) => item.isDefault) ?? active[0] ?? null;
}

export async function getAdminBrewingSetupStats(
  supabase: SupabaseClient,
  limit = 10,
): Promise<AdminEquipmentStat[]> {
  const { data, error } = await supabase.rpc("admin_brewing_setup_equipment_stats", { p_limit: limit });
  if (error) {
    console.error("getAdminBrewingSetupStats failed", error);
    return [];
  }
  return (data ?? []).map((row: { category: string; item_name: string; user_count: number }) => ({
    category: row.category,
    itemName: row.item_name,
    userCount: Number(row.user_count),
  }));
}
