import type { PreferredUnits } from "@/types/personal";

export const USER_EQUIPMENT_CATEGORIES = [
  "brewer",
  "grinder",
  "kettle",
  "scale",
  "filter",
  "espresso_machine",
  "xbloom",
  "other",
] as const;

export type UserEquipmentCategory = (typeof USER_EQUIPMENT_CATEGORIES)[number];

export const USER_EXPERIENCE_LEVELS = ["beginner", "intermediate", "advanced", "professional"] as const;
export type UserExperienceLevel = (typeof USER_EXPERIENCE_LEVELS)[number];

export const USER_SETUP_CONTEXTS = ["home", "cafe", "both"] as const;
export type UserSetupContext = (typeof USER_SETUP_CONTEXTS)[number];

export type UserEquipmentItem = {
  id: string;
  userId: string;
  category: UserEquipmentCategory;
  deviceId: string | null;
  deviceName: string | null;
  grinderId: string | null;
  grinderName: string | null;
  filterTypeId: string | null;
  filterTypeName: string | null;
  xbloomDeviceId: string | null;
  xbloomDeviceName: string | null;
  customLabel: string | null;
  displayName: string;
  notes: string | null;
  isDefault: boolean;
  isFavorite: boolean;
  isRetired: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type UserBrewingProfile = {
  id: string;
  userId: string;
  experienceLevel: UserExperienceLevel | null;
  setupContext: UserSetupContext;
  favoriteRoastLevel: string | null;
  favoriteProcessing: string | null;
  favoriteBrewRatio: string | null;
  favoriteTemperatureC: number | null;
  preferredUnits: PreferredUnits | null;
  preferredWaterProfileId: string | null;
  preferredWaterProfileName: string | null;
  favoriteBrewingMethodId: string | null;
  favoriteBrewingMethodName: string | null;
  defaultBrewerItemId: string | null;
  defaultGrinderItemId: string | null;
  defaultKettleItemId: string | null;
  defaultScaleItemId: string | null;
  defaultFilterItemId: string | null;
  favoriteOriginIds: string[];
  favoriteOriginLabels: string[];
  favoriteRecipeIds: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserBrewingSetup = {
  profile: UserBrewingProfile | null;
  equipment: UserEquipmentItem[];
};

export type BrewingSetupExport = {
  version: 1;
  exportedAt: string;
  profile: Omit<UserBrewingProfile, "id" | "userId" | "createdAt" | "updatedAt" | "favoriteOriginLabels"> & {
    favoriteOriginIds: string[];
  };
  equipment: Array<
    Omit<UserEquipmentItem, "id" | "userId" | "createdAt" | "updatedAt" | "displayName" | "deviceName" | "grinderName" | "filterTypeName" | "xbloomDeviceName">
  >;
};

export type RecipeSetupCompatibility = {
  compatible: boolean;
  score: number;
  summary: string;
  recommendedGrinder: string | null;
  recommendedBrewer: string | null;
  warnings: string[];
  matches: string[];
};

export type AdminEquipmentStat = {
  category: string;
  itemName: string;
  userCount: number;
};

export type DbUserEquipmentItemRow = {
  id: string;
  user_id: string;
  category: UserEquipmentCategory;
  device_id: string | null;
  devices: { id: string; name: string } | null;
  grinder_id: string | null;
  grinders: { id: string; name: string } | null;
  filter_type_id: string | null;
  filter_types: { id: string; name: string } | null;
  xbloom_device_id: string | null;
  xbloom_devices: { id: string; name: string } | null;
  custom_label: string | null;
  notes: string | null;
  is_default: boolean;
  is_favorite: boolean;
  is_retired: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbUserBrewingProfileRow = {
  id: string;
  user_id: string;
  experience_level: UserExperienceLevel | null;
  setup_context: UserSetupContext;
  favorite_roast_level: string | null;
  favorite_processing: string | null;
  favorite_brew_ratio: string | null;
  favorite_temperature_c: number | null;
  preferred_units: PreferredUnits | null;
  preferred_water_profile_id: string | null;
  water_profiles: { id: string; name: string } | null;
  favorite_brewing_method_id: string | null;
  brewing_methods: { id: string; name: string } | null;
  default_brewer_item_id: string | null;
  default_grinder_item_id: string | null;
  default_kettle_item_id: string | null;
  default_scale_item_id: string | null;
  default_filter_item_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_brewing_profile_origins: { origin_id: string; origins: { id: string; country: string; region: string } | null }[] | null;
  user_brewing_profile_recipes: { recipe_id: string }[] | null;
};
