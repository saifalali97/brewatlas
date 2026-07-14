/**
 * Universal Recipe Converter engine types (Phase 17.2 base engine,
 * Phase 17.3 smart conversion rules).
 *
 * Everything in `lib/converter/` is pure, deterministic, and framework-free
 * -- no AI, no network calls, no Supabase. Given the same input it always
 * returns the same output, so it's safe to call from Server or Client
 * Components alike.
 */

/** Canonical brew-method identifiers, one dedicated rule module per id (see `lib/converter/rules/`). */
export type BrewMethodId =
  | "v60"
  | "origami"
  | "kalitaWave"
  | "chemex"
  | "aeropress"
  | "cleverDripper"
  | "frenchPress"
  | "switch"
  | "mokaPot"
  | "orea"
  | "aprilBrewer"
  | "xbloomStudio"
  | "xbloomOmni"
  | "xbloomOriginal"
  | "espresso"
  | "coldBrew";

/**
 * Broad brewing style a method belongs to. Used to decide when
 * cross-method brew-time scaling is even meaningful (e.g. a pour-over
 * time doesn't scale proportionally into a cold brew steep) -- it does
 * NOT determine the conversion math itself, which lives per-device in
 * `lib/converter/rules/`.
 */
export type BrewCategory = "pourOver" | "immersion" | "hybrid" | "pressurized" | "coldBrew";

export type NumericRange = {
  min: number;
  max: number;
  default: number;
};

/**
 * Safety envelope for one brew method -- the realistic min/max/default for
 * each dimension. Every device rule's output is clamped into its own
 * profile before leaving the engine (see `rule-helpers.ts`), so no
 * combination of preferences can ever recommend something impossible
 * (boiling cold brew, espresso-fine French press, etc).
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
  /** Whether this method is brewed as discrete pour stages (pour-over/hybrid) vs. a single fill (immersion/pressurized/cold brew). */
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

/** One discrete water addition in a device's pour plan, including the bloom (if any) as its own stage. */
export type PourStage = {
  label: "bloom" | "pour";
  waterGrams: number;
  /** Seconds from the start of the brew. */
  atSeconds: number;
};

/**
 * The physical shape of a device's pour plan -- how a target device's
 * rule module (see `lib/converter/rules/`) actually delivers its water,
 * independent of how many discrete stages it takes. Kept as a closed set
 * of brewing-technique categories (not free text) so it stays a
 * structured, translatable engine output rather than hardcoded prose.
 */
export type PourStyle =
  /** Pour-over: slow center-out spiral, common on conical drippers (V60, Orea). */
  | "spiral"
  /** Pour-over: frequent small pulses to keep a flat bed level (Kalita Wave, Origami). */
  | "pulse"
  /** Pour-over: few large, deliberate pours (Chemex, April Brewer). */
  | "singlePour"
  /** Pour-over/hybrid: a small number of precisely centered machine pours (xBloom). */
  | "centerPulse"
  /** Full immersion, no discrete pours (French Press, Clever Dripper, Switch's closed-valve phase). */
  | "immersion"
  /** Long, cold, static immersion (Cold Brew). */
  | "steep"
  /** Continuous pressurized flow through a compact puck (Espresso, Moka Pot). */
  | "pressurized";

/**
 * Everything the source recipe's numbers resolve to before being handed
 * to the target device's rule module. This is the common "language" every
 * `DeviceRule.computeTarget` reads from -- what differs per device is how
 * it reacts to it, not the shape of the input.
 */
export type DeviceComputationContext = {
  doseG: number;
  /** 0 (finest) - 10 (coarsest), already parsed/clamped against the source device's own grind range. */
  sourceGrindIndex: number;
  sourceCategory: BrewCategory;
  sourceProfile: BrewMethodProfile;
  sourceTemperatureC: number;
  sourceBrewTimeSeconds: number;
  preferences: ConversionPreferences;
};

/** Raw (pre-safety-clamp) target parameters a device rule computes. `convertRecipe` clamps this into the device's own `BrewMethodProfile` before returning it. */
export type DeviceComputationResult = {
  ratio: number;
  grindIndex: number;
  temperatureC: number;
  brewTimeSeconds: number;
  bloomGrams: number | null;
  bloomTimeSeconds: number | null;
  poursCount: number;
  pourStyle: PourStyle;
};

/**
 * One brew method's full brewing intelligence: its safety envelope
 * (`profile`) plus the device-specific logic that decides how a source
 * recipe and the user's preferences translate into ideal parameters for
 * *this* device. See `lib/converter/rules/` -- every device has its own
 * module and its own reasoning, never a shared formula.
 */
export type DeviceRule = {
  id: BrewMethodId;
  profile: BrewMethodProfile;
  computeTarget: (context: DeviceComputationContext) => DeviceComputationResult;
};

export type ConversionSuccess = {
  supported: true;
  sourceMethod: BrewMethodId;
  targetMethod: BrewMethodId;
  /** The target method's brewing style -- lets the UI pick correct wording (e.g. "steep" vs. "pour") without re-deriving it from `targetMethod`. */
  targetCategory: BrewCategory;
  dose: { grams: number; display: string };
  water: { grams: number; ratio: number; display: string };
  grindSize: GrindResult;
  temperature: { celsius: number; display: string };
  bloom: { grams: number | null; timeSeconds: number | null; display: string };
  brewTime: { seconds: number; display: string };
  pours: { count: number; style: PourStyle; stages: PourStage[]; display: string };
};

export type ConversionFailure = {
  supported: false;
  reason: string;
};

export type ConversionResult = ConversionSuccess | ConversionFailure;
