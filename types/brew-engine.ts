import type { LookupOption } from "@/types/recipe";

/** `public.brew_devices` row -- the Smart Brewing Engine's equipment catalog. */
export type BrewDeviceRow = LookupOption;

/** A single ordered pour/agitation step belonging to a brew profile. */
export type BrewProfileStepRow = {
  id: string;
  stepNumber: number;
  waterAmount: number | null;
  pourDuration: string | null;
  waitAfter: string | null;
  description: string | null;
};

/** A structured, replayable brewing specification (`public.brew_profiles`). */
export type BrewProfileRow = {
  id: string;
  dose: number | null;
  beverageWeight: number | null;
  brewRatio: string | null;
  waterTemperature: number | null;
  brewTime: string | null;
  bloomTime: string | null;
  bloomWater: number | null;
  grinderName: string | null;
  grinderSetting: string | null;
  filterType: string | null;
  agitation: string | null;
  tds: number | null;
  extractionYield: number | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

/** A brew profile with its ordered steps attached, as used by the future profile editor/detail view. */
export type BrewProfileFullDetail = BrewProfileRow & {
  steps: BrewProfileStepRow[];
};

/** Raw shape of a `brew_profile_steps` row as selected from Supabase (snake_case). */
export type DbBrewProfileStepRow = {
  id: string;
  step_number: number;
  water_amount: number | null;
  pour_duration: string | null;
  wait_after: string | null;
  description: string | null;
};

/** Raw shape of a `brew_profiles` row as selected from Supabase, including its steps join. */
export type DbBrewProfileRow = {
  id: string;
  dose: number | null;
  beverage_weight: number | null;
  brew_ratio: string | null;
  water_temperature: number | null;
  brew_time: string | null;
  bloom_time: string | null;
  bloom_water: number | null;
  grinder_name: string | null;
  grinder_setting: string | null;
  filter_type: string | null;
  agitation: string | null;
  tds: number | null;
  extraction_yield: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  brew_profile_steps: DbBrewProfileStepRow[] | null | undefined;
};

/** The subset of a `recipes` row relevant to the Smart Brewing Engine link. */
export type RecipeBrewEngineLink = {
  brewProfileId: string | null;
  brewDeviceId: string | null;
  brewDeviceName: string | null;
};
