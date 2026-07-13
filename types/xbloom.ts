import type { LookupOption } from "@/types/recipe";

/** `public.xbloom_devices` row -- the supported xBloom hardware catalog. */
export type XBloomDeviceRow = LookupOption;

/** The canonical set of supported xBloom device models (mirrors the DB `check` constraint and seed data). */
export const XBLOOM_DEVICE_MODELS = [
  "xBloom Studio",
  "xBloom Original",
  "xBloom Lite",
  "xBloom Omni",
] as const;

export type XBloomDeviceModel = (typeof XBLOOM_DEVICE_MODELS)[number];

/** A single ordered pulse/pour step belonging to an xBloom profile. */
export type XBloomProfileStepRow = {
  id: string;
  stepNumber: number;
  waterAmount: number | null;
  flowRate: number | null;
  delay: string | null;
  description: string | null;
};

/** `public.xbloom_profiles` row -- xBloom-specific brewing settings for a recipe. */
export type XBloomProfileRow = {
  id: string;
  recipeId: string;
  deviceModel: XBloomDeviceModel | null;
  grindSetting: string | null;
  waterTemperature: number | null;
  brewWater: number | null;
  dose: number | null;
  bloomTime: string | null;
  flowRate: number | null;
  pulsePattern: string | null;
  pourSequence: string | null;
  agitation: string | null;
  dripper: string | null;
  filter: string | null;
  totalTime: string | null;
  brewNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** An xBloom profile with its ordered steps attached, as used by a future profile editor/detail view. */
export type XBloomProfileFullDetail = XBloomProfileRow & {
  steps: XBloomProfileStepRow[];
};

/** Raw shape of an `xbloom_profile_steps` row as selected from Supabase (snake_case). */
export type DbXBloomProfileStepRow = {
  id: string;
  step_number: number;
  water_amount: number | null;
  flow_rate: number | null;
  delay: string | null;
  description: string | null;
};

/** Raw shape of an `xbloom_profiles` row as selected from Supabase, including its steps join. */
export type DbXBloomProfileRow = {
  id: string;
  recipe_id: string;
  device_model: XBloomDeviceModel | null;
  grind_setting: string | null;
  water_temperature: number | null;
  brew_water: number | null;
  dose: number | null;
  bloom_time: string | null;
  flow_rate: number | null;
  pulse_pattern: string | null;
  pour_sequence: string | null;
  agitation: string | null;
  dripper: string | null;
  filter: string | null;
  total_time: string | null;
  brew_notes: string | null;
  created_at: string;
  updated_at: string;
  xbloom_profile_steps: DbXBloomProfileStepRow[];
};
