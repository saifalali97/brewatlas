/**
 * BrewAtlas Recipe Personalization Engine — shared types.
 *
 * Official recipes stay immutable. Personalization produces an in-memory
 * snapshot for display only; nothing is written to Supabase.
 */

export type RecipeServingStyle = "hot" | "iced";

export type DynamicBrewMethod =
  | "v60"
  | "origami"
  | "kalita"
  | "chemex"
  | "aeropress"
  | "french-press";

/**
 * Dynamic Recipe System adjustment knobs.
 * Official recipes stay immutable; these produce an in-memory personalized brew.
 */
export type PersonalizationAdjustments = {
  servingStyle?: RecipeServingStyle;
  brewMethod?: DynamicBrewMethod;
  coffeeDoseG?: number;
  /** Beverage ratio denominator, e.g. 15 for 1:15. */
  brewRatio?: number;
  waterAmountG?: number;
  /** Relative strength multiplier against official ratio (1 = unchanged). */
  strength?: number;
  brewTemperatureC?: number;
  /** Target numeric brew pour count (1–5). */
  pourCount?: number;
  /**
   * Relative grind offset vs official recommendation.
   * Negative = finer, positive = coarser, 0 = official.
   */
  grindOffset?: number;
  yieldG?: number;
  cups?: number;
  grinderLabel?: string;
};

export type PersonalizedPour = {
  id: string;
  pourNumber: number;
  /** Numeric grams when the pour adds water; null for Prep / Swirl / Drawdown. */
  waterAmountG: number | null;
  /** Display label (e.g. "40 g", "Prep", "Swirl"). */
  waterAmountLabel: string;
  timeLabel: string;
  notes: string;
  atSeconds: number;
  durationSeconds: number;
};

export type PersonalizedEquipmentItem = {
  name: string;
  detail: string;
};

/**
 * Canonical brew snapshot used by the personalization engine.
 * Both DB recipes and Gulf/placeholder recipes map into this shape.
 */
export type BrewSnapshot = {
  servingStyle: RecipeServingStyle;
  coffeeDoseG: number | null;
  /** Hot brew water in grams (excludes ice). */
  hotWaterG: number | null;
  iceG: number | null;
  temperatureC: number | null;
  /** Display temperature string when °C alone is insufficient (e.g. "94°C → ice"). */
  temperatureLabel: string | null;
  ratioLabel: string | null;
  grindSize: string | null;
  bloomAmountG: number | null;
  bloomTimeLabel: string | null;
  brewTimeLabel: string | null;
  totalBrewTimeLabel: string | null;
  pours: PersonalizedPour[];
  equipment: PersonalizedEquipmentItem[];
  brewingTips: string[];
  extractionNotes: string[];
  waterProfileLabel: string | null;
  /** xBloom / device RPM when the recipe provides it — never invented. */
  rpm: number | null;
};

/** Per-recipe personalization policy (admin-configurable, safe defaults). */
export type PersonalizationConfig = {
  enabled: boolean;
  hotSupported: boolean;
  icedSupported: boolean;
  /** Percent of total brew water that becomes ice in iced mode (0–100). */
  icedWaterPercentage: number;
  doseScalable: boolean;
  ratioScalable: boolean;
  poursScalable: boolean;
  temperatureScalable: boolean;
  grindScalable: boolean;
};

export type PersonalizationResult = {
  official: BrewSnapshot;
  personalized: BrewSnapshot;
  adjustments: PersonalizationAdjustments;
  isPersonalized: boolean;
  activeServingStyle: RecipeServingStyle;
};

export type PersonalizationCopy = {
  hotWaterLabel: string;
  iceLabel: string;
  iceEquipmentName: string;
  iceEquipmentDetailTemplate: string;
  flashPrepNotesTemplate: string;
  flashSwirlNotes: string;
  flashTipScale: string;
  flashTipChill: string;
  flashExtractionNote: string;
  hotTipRestore: string;
  hotExtractionNote: string;
};
