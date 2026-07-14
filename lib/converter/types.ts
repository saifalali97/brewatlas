/**
 * Universal Recipe Converter engine types (Phase 17.2).
 *
 * Everything in `lib/converter/` is pure, deterministic, and framework-free
 * -- no AI, no network calls, no Supabase. Given the same input it always
 * returns the same output, so it's safe to call from Server or Client
 * Components alike.
 */

/** Canonical brew-method identifiers the engine has a profile for. */
export type BrewMethodId =
  | "v60"
  | "origami"
  | "kalitaWave"
  | "chemex"
  | "aeropress"
  | "cleverDripper"
  | "frenchPress"
  | "orea"
  | "aprilBrewer"
  | "xbloomStudio"
  | "xbloomOmni"
  | "xbloomOriginal"
  | "espresso"
  | "coldBrew";

/** Broad brewing style a method belongs to -- drives which conversion rules apply (see `convert-recipe.ts`). */
export type BrewCategory = "pourOver" | "immersion" | "pressurized" | "coldBrew";

export type NumericRange = {
  min: number;
  max: number;
  default: number;
};

/**
 * Deterministic extraction profile for one brew method. Every number here
 * is a reasonable, documented approximation for specialty-coffee brewing
 * (not a scientific measurement) -- good enough to drive believable,
 * consistent conversions between devices.
 */
export type BrewMethodProfile = {
  id: BrewMethodId;
  category: BrewCategory;
  /** Coffee:water ratio, expressed as grams of water per gram of coffee (e.g. 16 = "1:16"). */
  ratio: NumericRange;
  temperatureC: NumericRange;
  /** Position on the 0 (finest) - 10 (coarsest) normalized grind scale, see `grind-scale.ts`. */
  grind: NumericRange;
  brewTimeSeconds: NumericRange;
  defaultDoseG: number;
  supportsBloom: boolean;
  /** Bloom water as a multiple of dose (e.g. 2.5 = 2.5x the dry coffee weight). Ignored when `supportsBloom` is false. */
  bloomMultiplier: number;
  defaultBloomTimeSeconds: number;
  /** Whether this method is brewed as discrete pour stages (pour-over) vs. a single fill (immersion/pressurized/cold brew). */
  supportsPours: boolean;
  defaultPoursCount: number;
};

export type ConversionPreferences = {
  preserveBody: boolean;
  preserveSweetness: boolean;
  preserveAcidity: boolean;
};

/**
 * Raw inputs for a conversion. Every numeric/text field is optional --
 * anything omitted falls back to the source method's profile defaults,
 * so the engine works equally well for a fully-specified DB recipe and a
 * static recipe that only has a brew method name.
 */
export type ConversionInput = {
  /** Free-text brew method/device name from the recipe (e.g. "V60", "Hario V60", "Pour Over"). Resolved via `resolveBrewMethod`. */
  sourceMethod: string;
  /** Free-text target device name -- in practice always one of `CONVERTER_DEVICES` from the converter UI. */
  targetMethod: string;
  doseG?: number | null;
  waterG?: number | null;
  /** Free-text grind description (e.g. "Medium-Fine"). Parsed via `parseGrindLabel`. */
  grindSize?: string | null;
  temperatureC?: number | null;
  bloomAmountG?: number | null;
  /** Free-text bloom time (e.g. "0:30"). Parsed via `parseTimeToSeconds`. */
  bloomTime?: string | null;
  /** Free-text total brew time (e.g. "3:30"). Parsed via `parseTimeToSeconds`. */
  brewTime?: string | null;
  poursCount?: number | null;
  preferences: ConversionPreferences;
};

export type GrindResult = {
  index: number;
  label: string;
  microns: number;
  display: string;
};

export type ConversionSuccess = {
  supported: true;
  sourceMethod: BrewMethodId;
  targetMethod: BrewMethodId;
  /** The target method's brewing style -- lets the UI pick correct wording (e.g. "steep" vs. "pour") without re-deriving it from `targetMethod`. */
  targetCategory: BrewCategory;
  dose: { grams: number; display: string };
  water: { grams: number; display: string };
  grindSize: GrindResult;
  temperature: { celsius: number; display: string };
  bloom: { grams: number | null; timeSeconds: number | null; display: string };
  brewTime: { seconds: number; display: string };
  pours: { count: number; display: string };
};

export type ConversionFailure = {
  supported: false;
  reason: string;
};

export type ConversionResult = ConversionSuccess | ConversionFailure;
