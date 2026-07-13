import type {
  BeverageStrength,
  ExpectedSensoryProfile,
  ExtractionRisk,
  RecipeAnalysisInput,
  RecipeAnalysisResult,
  RecipeWarning,
} from "@/types/intelligence";

/**
 * The BrewAtlas Recipe Intelligence Engine: pure, deterministic, reusable
 * functions that turn a recipe's brewing parameters into calculated
 * insights (brew ratio, beverage strength, extraction risk, difficulty
 * score, expected sensory profile) and intelligent warnings.
 *
 * Every function here is a plain function of its arguments -- no I/O, no
 * Supabase, no Next.js. That's what makes them reusable: the same engine
 * can analyze a recipe being created in a Server Action, a recipe already
 * stored in the database, or a hypothetical recipe in a future "what if I
 * change the ratio" preview UI.
 *
 * The scoring model is a heuristic approximation of well-known specialty
 * coffee brewing guidelines (SCA-style temperature/ratio targets), not a
 * lab measurement -- see ENGINE_VERSION below, which should be bumped
 * whenever the thresholds or formulas change so stored results can be
 * identified as stale.
 */

export const ENGINE_VERSION = "1.0";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Parses a free-form brew-time string into seconds. Understands
 * "mm:ss" (e.g. "3:30"), plain seconds ("45"), and "<n> hr" / "<n> hour(s)"
 * (used by cold brew). Returns `null` if it can't confidently parse.
 */
export function parseTimeToSeconds(value: string | null): number | null {
  if (!value) return null;
  const trimmed = value.trim().toLowerCase();

  const hourMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(hr|hour|hours)$/);
  if (hourMatch) return Number(hourMatch[1]) * 3600;

  const mmss = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2]);

  const plainSeconds = trimmed.match(/^(\d+(?:\.\d+)?)\s*(s|sec|secs|seconds)?$/);
  if (plainSeconds) return Number(plainSeconds[1]);

  return null;
}

/** Coarseness scale used to compare free-text grind descriptors: 1 = finest, 7 = coarsest. */
const GRIND_SCALE: Record<string, number> = {
  "extra fine": 1,
  fine: 2,
  "medium-fine": 3,
  "medium fine": 3,
  medium: 4,
  "medium-coarse": 5,
  "medium coarse": 5,
  coarse: 6,
  "extra coarse": 7,
};

/** Maps a free-text grind descriptor (e.g. "Medium-Fine") to the 1 (finest) - 7 (coarsest) scale. */
export function grindSizeToScale(grindSize: string | null): number | null {
  if (!grindSize) return null;
  const key = grindSize.trim().toLowerCase();
  return GRIND_SCALE[key] ?? null;
}

export type MethodProfile = {
  /** Expected water temperature range, in Celsius. */
  tempRangeC: [number, number];
  /** Expected brew ratio range, expressed as water-to-coffee (e.g. 16 means 1:16). */
  ratioRange: [number, number];
  /** Expected grind coarseness range on the 1 (finest) - 7 (coarsest) scale. */
  grindRange: [number, number];
  /** Expected bloom duration range in seconds, or `null` for methods without a bloom step. */
  bloomSecondsRange: [number, number] | null;
  /** How much deliberate agitation the method typically tolerates/expects. */
  agitationTolerance: "low" | "medium" | "high";
};

const METHOD_PROFILES: { match: RegExp; profile: MethodProfile }[] = [
  {
    match: /espresso/i,
    profile: {
      tempRangeC: [90, 96],
      ratioRange: [1.8, 2.5],
      grindRange: [1, 2],
      bloomSecondsRange: null,
      agitationTolerance: "low",
    },
  },
  {
    match: /cold brew/i,
    profile: {
      tempRangeC: [0, 25],
      ratioRange: [8, 15],
      grindRange: [5, 7],
      bloomSecondsRange: null,
      agitationTolerance: "low",
    },
  },
  {
    match: /french press|clever|immersion/i,
    profile: {
      tempRangeC: [92, 96],
      ratioRange: [14, 17],
      grindRange: [5, 7],
      bloomSecondsRange: null,
      agitationTolerance: "high",
    },
  },
  {
    match: /aeropress/i,
    profile: {
      tempRangeC: [80, 94],
      ratioRange: [12, 17],
      grindRange: [2, 4],
      bloomSecondsRange: null,
      agitationTolerance: "medium",
    },
  },
  {
    match: /siphon/i,
    profile: {
      tempRangeC: [90, 94],
      ratioRange: [13, 15],
      grindRange: [3, 5],
      bloomSecondsRange: null,
      agitationTolerance: "medium",
    },
  },
];

/** Default profile for pour-over-family methods (V60, Chemex, Pour Over, Kalita Wave, etc.) and unrecognized methods. */
const DEFAULT_METHOD_PROFILE: MethodProfile = {
  tempRangeC: [90, 96],
  ratioRange: [14.5, 17],
  grindRange: [2, 4],
  bloomSecondsRange: [25, 45],
  agitationTolerance: "low",
};

/** Looks up the expected brewing envelope for a brewing method name, falling back to the pour-over default. */
export function getMethodProfile(brewingMethodName: string | null): MethodProfile {
  if (!brewingMethodName) return DEFAULT_METHOD_PROFILE;
  const match = METHOD_PROFILES.find((entry) => entry.match.test(brewingMethodName));
  return match?.profile ?? DEFAULT_METHOD_PROFILE;
}

/** Computes the brew ratio (water:coffee) as both a display string ("1:16.2") and a raw number (16.2). */
export function calcBrewRatio(
  coffeeDose: number | null,
  waterAmount: number | null,
): { display: string | null; value: number | null } {
  if (!coffeeDose || !waterAmount || coffeeDose <= 0) return { display: null, value: null };
  const value = round1(waterAmount / coffeeDose);
  return { display: `1:${value}`, value };
}

/** Classifies beverage strength from the brew ratio relative to the method's expected range. */
export function calcBeverageStrength(ratioValue: number | null, profile: MethodProfile): BeverageStrength | null {
  if (ratioValue === null) return null;
  if (ratioValue < profile.ratioRange[0]) return "Strong";
  if (ratioValue > profile.ratioRange[1]) return "Light";
  return "Balanced";
}

/**
 * Estimates over/under-extraction risk from temperature, grind, ratio, and
 * total brew time relative to the method's expected envelope. Each signal
 * nudges a running score; the final score is bucketed into a risk label.
 */
export function calcExtractionRisk(input: RecipeAnalysisInput, profile: MethodProfile): ExtractionRisk | null {
  let score = 0;
  let signals = 0;

  if (input.waterTemperature !== null) {
    signals += 1;
    if (input.waterTemperature > profile.tempRangeC[1]) score += 1;
    if (input.waterTemperature < profile.tempRangeC[0]) score -= 1;
  }

  const grindScale = grindSizeToScale(input.grindSize);
  if (grindScale !== null) {
    signals += 1;
    if (grindScale < profile.grindRange[0]) score += 1; // finer than expected -> more surface area -> over-extraction leaning
    if (grindScale > profile.grindRange[1]) score -= 1; // coarser than expected -> under-extraction leaning
  }

  const { value: ratioValue } = calcBrewRatio(input.coffeeDose, input.waterAmount);
  if (ratioValue !== null) {
    signals += 1;
    if (ratioValue < profile.ratioRange[0]) score += 0.5;
    if (ratioValue > profile.ratioRange[1]) score -= 0.5;
  }

  if (signals === 0) return null;
  if (score >= 1) return "Over-extraction risk";
  if (score <= -1) return "Under-extraction risk";
  return "Balanced";
}

const METHOD_DIFFICULTY_BASE: { match: RegExp; base: number }[] = [
  { match: /espresso/i, base: 4 },
  { match: /siphon/i, base: 3 },
  { match: /aeropress/i, base: 1 },
  { match: /french press|clever/i, base: 0 },
  { match: /cold brew/i, base: 0 },
];

function methodDifficultyBase(brewingMethodName: string | null): number {
  if (!brewingMethodName) return 2;
  const match = METHOD_DIFFICULTY_BASE.find((entry) => entry.match.test(brewingMethodName));
  return match?.base ?? 2; // pour-over family default
}

/**
 * Scores how demanding a recipe is to execute consistently, from 1 (very
 * forgiving) to 10 (technically demanding), based on the brewing method,
 * pour count, grind precision required, and how far the ratio sits outside
 * the method's forgiving range.
 */
export function calcDifficultyScore(input: RecipeAnalysisInput, profile: MethodProfile): number {
  let score = 3 + methodDifficultyBase(input.brewingMethodName);

  if (input.pourCount !== null) {
    if (input.pourCount >= 3) score += 1;
    if (input.pourCount >= 5) score += 1;
  }

  const grindScale = grindSizeToScale(input.grindSize);
  if (grindScale !== null && grindScale <= 2) score += 1; // fine grinds are less forgiving of small errors

  const { value: ratioValue } = calcBrewRatio(input.coffeeDose, input.waterAmount);
  if (ratioValue !== null && (ratioValue < profile.ratioRange[0] || ratioValue > profile.ratioRange[1])) {
    score += 1;
  }

  if (profile.bloomSecondsRange !== null) {
    const bloomSeconds = parseTimeToSeconds(input.bloomTime);
    if (bloomSeconds !== null && (bloomSeconds < profile.bloomSecondsRange[0] || bloomSeconds > profile.bloomSecondsRange[1])) {
      score += 0.5;
    }
  }

  return round1(clamp(score, 1, 10));
}

/**
 * Predicts a 1-10 sensory profile (sweetness, acidity, body, clarity,
 * finish) from roast level, process, temperature, ratio, grind, and
 * agitation. This is a heuristic estimate meant to set expectations before
 * brewing, not a substitute for an actual cupping.
 */
export function calcExpectedSensoryProfile(input: RecipeAnalysisInput, profile: MethodProfile): ExpectedSensoryProfile {
  let sweetness = 5;
  let acidity = 5;
  let body = 5;
  let clarity = 5;
  let finish = 5;

  const roast = (input.roastLevel ?? "").toLowerCase();
  if (roast.includes("light")) {
    acidity += 2;
    clarity += 1;
    body -= 1;
  } else if (roast.includes("dark") || roast.includes("medium-dark")) {
    sweetness += 1;
    body += 1;
    acidity -= 2;
    clarity -= 1;
  }

  const process = (input.process ?? "").toLowerCase();
  if (process.includes("natural")) {
    sweetness += 2;
    body += 1;
    clarity -= 2;
  } else if (process.includes("honey")) {
    sweetness += 1;
    body += 1;
  } else if (process.includes("washed")) {
    clarity += 2;
    acidity += 1;
    body -= 1;
  }

  if (input.waterTemperature !== null) {
    if (input.waterTemperature > profile.tempRangeC[1]) {
      acidity += 1;
      body += 1;
      sweetness -= 1;
    } else if (input.waterTemperature < profile.tempRangeC[0]) {
      clarity += 1;
      body -= 1;
      sweetness -= 1;
    }
  }

  const { value: ratioValue } = calcBrewRatio(input.coffeeDose, input.waterAmount);
  if (ratioValue !== null) {
    const midpoint = (profile.ratioRange[0] + profile.ratioRange[1]) / 2;
    if (ratioValue < midpoint) {
      body += 1;
      clarity -= 1;
    } else if (ratioValue > midpoint) {
      clarity += 1;
      body -= 1;
    }
  }

  const grindScale = grindSizeToScale(input.grindSize);
  if (grindScale !== null) {
    if (grindScale <= profile.grindRange[0]) {
      body += 1;
      finish += 1;
      clarity -= 1;
    } else if (grindScale >= profile.grindRange[1]) {
      clarity += 1;
      body -= 1;
      finish -= 1;
    }
  }

  if (isHighAgitation(input)) {
    body += 1;
    clarity -= 1;
  }

  return {
    sweetness: clamp(Math.round(sweetness), 1, 10),
    acidity: clamp(Math.round(acidity), 1, 10),
    body: clamp(Math.round(body), 1, 10),
    clarity: clamp(Math.round(clarity), 1, 10),
    finish: clamp(Math.round(finish), 1, 10),
  };
}

export const HIGH_AGITATION_PATTERN = /vigorous|aggressive|rapid|hard\s*(swirl|stir|shake)|multiple\s*(swirl|stir)|heavy\s*(swirl|stir)/i;

/** True if any of the (recipe / Smart Brewing Engine / xBloom) agitation signals describe high-intensity agitation. Exported for reuse by `lib/ai/coach-engine.ts`. */
export function isHighAgitation(input: RecipeAnalysisInput): boolean {
  const signals = [input.agitation, input.brewProfileAgitation, input.xbloomAgitation, input.xbloomPulsePattern];
  return signals.some((signal) => signal !== null && signal !== undefined && HIGH_AGITATION_PATTERN.test(signal));
}

const TEMP_TOLERANCE_C = 1.5;

/** Generates the nine intelligent warning types the Recipe Intelligence Engine supports, where applicable. */
export function generateWarnings(input: RecipeAnalysisInput, profile: MethodProfile): RecipeWarning[] {
  const warnings: RecipeWarning[] = [];
  const methodLabel = input.brewingMethodName ?? "this brewing method";

  if (input.waterTemperature !== null) {
    if (input.waterTemperature > profile.tempRangeC[1] + TEMP_TOLERANCE_C) {
      warnings.push({
        code: "water_too_hot",
        severity: "warning",
        message: `${input.waterTemperature}°C is above the ${profile.tempRangeC[0]}-${profile.tempRangeC[1]}°C range typically recommended for ${methodLabel}, risking bitterness and over-extraction.`,
      });
    } else if (input.waterTemperature < profile.tempRangeC[0] - TEMP_TOLERANCE_C) {
      warnings.push({
        code: "water_too_cold",
        severity: "warning",
        message: `${input.waterTemperature}°C is below the ${profile.tempRangeC[0]}-${profile.tempRangeC[1]}°C range typically recommended for ${methodLabel}, risking a flat, under-extracted cup.`,
      });
    }
  }

  const grindScale = grindSizeToScale(input.grindSize);
  if (grindScale !== null) {
    if (grindScale < profile.grindRange[0]) {
      warnings.push({
        code: "grind_too_fine",
        severity: "warning",
        message: `The grind is finer than typically recommended for ${methodLabel}, which can cause over-extraction, excess bitterness, or a stalled/clogged brew.`,
      });
    } else if (grindScale > profile.grindRange[1]) {
      warnings.push({
        code: "grind_too_coarse",
        severity: "warning",
        message: `The grind is coarser than typically recommended for ${methodLabel}, which can cause under-extraction and a weak, sour cup.`,
      });
    }
  }

  const { value: ratioValue } = calcBrewRatio(input.coffeeDose, input.waterAmount);
  if (ratioValue !== null) {
    if (ratioValue < profile.ratioRange[0]) {
      warnings.push({
        code: "ratio_too_strong",
        severity: "info",
        message: `A 1:${ratioValue} ratio is stronger than the typical 1:${profile.ratioRange[0]}-1:${profile.ratioRange[1]} range for ${methodLabel}.`,
      });
    } else if (ratioValue > profile.ratioRange[1]) {
      warnings.push({
        code: "ratio_too_weak",
        severity: "info",
        message: `A 1:${ratioValue} ratio is weaker than the typical 1:${profile.ratioRange[0]}-1:${profile.ratioRange[1]} range for ${methodLabel}.`,
      });
    }
  }

  if (profile.bloomSecondsRange !== null) {
    const bloomSeconds = parseTimeToSeconds(input.bloomTime);
    if (bloomSeconds !== null) {
      if (bloomSeconds < profile.bloomSecondsRange[0]) {
        warnings.push({
          code: "bloom_too_short",
          severity: "info",
          message: `A ${bloomSeconds}s bloom is shorter than the ${profile.bloomSecondsRange[0]}-${profile.bloomSecondsRange[1]}s typically recommended, which may leave CO2 trapped and cause uneven extraction.`,
        });
      } else if (bloomSeconds > profile.bloomSecondsRange[1]) {
        warnings.push({
          code: "bloom_too_long",
          severity: "info",
          message: `A ${bloomSeconds}s bloom is longer than the ${profile.bloomSecondsRange[0]}-${profile.bloomSecondsRange[1]}s typically recommended, which may over-steep the grounds before the main pours.`,
        });
      }
    }
  }

  if (isHighAgitation(input) && profile.agitationTolerance === "low") {
    warnings.push({
      code: "excessive_agitation",
      severity: "warning",
      message: `${methodLabel} typically favors gentle handling; vigorous stirring/swirling/pulsing can cause fines migration and muddy the cup.`,
    });
  }

  return warnings;
}

/** Runs the full Recipe Intelligence Engine on a recipe's brewing parameters. Deterministic and side-effect free. */
export function analyzeRecipe(input: RecipeAnalysisInput): RecipeAnalysisResult {
  const profile = getMethodProfile(input.brewingMethodName);
  const ratio = calcBrewRatio(input.coffeeDose, input.waterAmount);

  return {
    brewRatio: ratio.display,
    brewRatioValue: ratio.value,
    beverageStrength: calcBeverageStrength(ratio.value, profile),
    extractionRisk: calcExtractionRisk(input, profile),
    difficultyScore: calcDifficultyScore(input, profile),
    expected: calcExpectedSensoryProfile(input, profile),
    warnings: generateWarnings(input, profile),
    engineVersion: ENGINE_VERSION,
  };
}
