import { analyzeRecipeForCoaching } from "@/lib/ai/coach-engine";
import { clamp, formatSeconds, scaleToGrindLabel } from "@/lib/ai/coach-utils";
import { DEVICE_RULES, formatRatio, formatSecondsAsDuration, grindIndexToResult, resolveBrewMethod } from "@/lib/converter";
import { parseTimeToSeconds } from "@/lib/intelligence/recipe-analysis";
import type { CoachAnalysisInput, CoachMetricEvaluation } from "@/types/coach";
import type {
  CoachToolInput,
  CoachToolResult,
  ExplanationPoint,
  FlavorNoteCode,
  ProcessCode,
  RoastLevelCode,
  SuggestedRecipe,
} from "@/types/coach-tools";

/**
 * The AI Coach Foundation's mock reasoning (Phase 19). Every function
 * here is pure and deterministic -- no randomness, no I/O -- built on
 * top of two engines that already exist rather than a fourth parallel
 * one:
 *
 * - `analyzeRecipeForCoaching` (`lib/ai/coach-engine.ts`) diagnoses an
 *   existing recipe's 15 metrics against known-good ranges; Diagnose
 *   Brew and Improve Recipe both correct toward those ranges.
 * - `DEVICE_RULES` (`lib/converter/rules/`) already encodes each
 *   device's realistic dose/ratio/grind/temperature/time envelope;
 *   Generate Recipe starts from a device's own baseline rather than
 *   inventing a new one.
 *
 * `lib/ai/coach-tools-adapter.ts` is the only seam meant to change when
 * a real model replaces this -- nothing here should need to.
 */

const ROAST_LEVEL_TEXT: Record<RoastLevelCode, string> = {
  light: "Light Roast",
  medium: "Medium Roast",
  mediumDark: "Medium-Dark Roast",
  dark: "Dark Roast",
};

const PROCESS_TEXT: Record<ProcessCode, string> = {
  washed: "Washed",
  natural: "Natural",
  honey: "Honey",
  anaerobic: "Anaerobic",
};

const ROAST_FLAVORS: Record<RoastLevelCode, FlavorNoteCode[]> = {
  light: ["bright", "citrus", "floral"],
  medium: ["balanced", "caramel"],
  mediumDark: ["caramel", "nutty"],
  dark: ["heavy", "chocolate"],
};

const PROCESS_FLAVORS: Record<ProcessCode, FlavorNoteCode[]> = {
  washed: ["clean", "bright"],
  natural: ["berry", "winey"],
  honey: ["caramel", "syrupy"],
  anaerobic: ["tropicalFruit", "winey"],
};

const ORIGIN_FLAVOR_HINTS: { match: RegExp; flavors: FlavorNoteCode[] }[] = [
  { match: /ethiopia|kenya/i, flavors: ["floral", "citrus"] },
  { match: /brazil|colombia|guatemala|honduras/i, flavors: ["nutty", "chocolate"] },
  { match: /sumatra|indonesia|sulawesi/i, flavors: ["herbal", "heavy"] },
  { match: /yemen|harar/i, flavors: ["spice", "winey"] },
  { match: /panama|costa rica/i, flavors: ["stoneFruit", "clean"] },
];

function originFlavors(origin: string | null): FlavorNoteCode[] {
  if (!origin) return [];
  const hit = ORIGIN_FLAVOR_HINTS.find((entry) => entry.match.test(origin));
  return hit?.flavors ?? [];
}

/** Directional taste-preference signal parsed from free-text notes -- a deterministic stand-in for what a real model would infer from the same text (`lib/ai/coach-prompts.ts` sends the raw text too). */
type NotesIntent = {
  wantsMoreExtraction: boolean;
  wantsLessExtraction: boolean;
  wantsStronger: boolean;
  wantsWeaker: boolean;
  wantsBrighter: boolean;
  wantsSmoother: boolean;
  wantsSweeter: boolean;
  matched: boolean;
};

function sniffNotes(notes: string | null): NotesIntent {
  const text = (notes ?? "").toLowerCase();
  const has = (...keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

  const wantsMoreExtraction = has("sour", "weak", "thin", "watery", "under-extract");
  const wantsLessExtraction = has("bitter", "harsh", "astringent", "over-extract");
  const wantsStronger = has("stronger", "too weak", "bold");
  const wantsWeaker = has("weaker", "too strong", "too intense");
  const wantsBrighter = has("bright", "more acidity", "acidic", "fruitier");
  const wantsSmoother = has("smooth", "less acidic", "mellow", "rounder");
  const wantsSweeter = has("sweet", "sweeter", "caramel");

  return {
    wantsMoreExtraction,
    wantsLessExtraction,
    wantsStronger,
    wantsWeaker,
    wantsBrighter,
    wantsSmoother,
    wantsSweeter,
    matched:
      wantsMoreExtraction || wantsLessExtraction || wantsStronger || wantsWeaker || wantsBrighter || wantsSmoother || wantsSweeter,
  };
}

/** How many of the fields most relevant to a tool were actually filled in -- the basis for confidence, same "more real data = more confident" philosophy as `CoachConfidence` in `lib/ai/coach-engine.ts`. */
function computeConfidence(providedCount: number, relevantCount: number): CoachToolResult["confidence"] {
  if (relevantCount === 0) return "low";
  const ratio = providedCount / relevantCount;
  if (ratio >= 0.8) return "high";
  if (ratio >= 0.5) return "medium";
  return "low";
}

function toCoachAnalysisInput(input: CoachToolInput): CoachAnalysisInput {
  return {
    brewingMethodName: input.brewMethod ?? input.device ?? null,
    coffeeDose: input.doseG,
    waterAmount: input.waterG,
    waterTemperature: input.temperatureC,
    grindSize: input.grindSize,
    bloomTime: null,
    bloomAmount: null,
    totalBrewTime: input.brewTime,
    agitation: null,
    roastLevel: input.roastLevel ? ROAST_LEVEL_TEXT[input.roastLevel] : null,
    process: input.process ? PROCESS_TEXT[input.process] : null,
    pourCount: null,
    originCountry: input.origin,
  };
}

function metricByKey(metrics: CoachMetricEvaluation[], key: CoachMetricEvaluation["key"]): CoachMetricEvaluation | undefined {
  return metrics.find((metric) => metric.key === key);
}

const NEEDS_CORRECTION = new Set(["poor", "needs_attention"]);

/**
 * Corrects an existing recipe's grind/temperature/time/ratio toward the
 * evaluated ideal ranges wherever a metric came back poor or needing
 * attention, then layers on any directional adjustment implied by the
 * user's free-text notes (`intent`) -- used by both Diagnose Brew and
 * Improve Recipe, which share this exact correction logic and differ
 * only in whether notes are allowed to influence the result.
 */
function correctTowardIdeal(
  input: CoachToolInput,
  metrics: CoachMetricEvaluation[],
  intent: NotesIntent | null,
): { suggestedRecipe: SuggestedRecipe; explanation: ExplanationPoint[] } {
  const explanation: ExplanationPoint[] = [];

  const grindMetric = metricByKey(metrics, "grindSize");
  let grindScale = grindMetric?.rawValue ?? null;
  if (grindMetric && NEEDS_CORRECTION.has(grindMetric.status) && grindMetric.idealRange) {
    grindScale = (grindMetric.idealRange[0] + grindMetric.idealRange[1]) / 2;
  }

  let temperatureC = input.temperatureC;
  const tempMetric = metricByKey(metrics, "waterTemperature");
  if (tempMetric && NEEDS_CORRECTION.has(tempMetric.status) && tempMetric.idealRange) {
    temperatureC = Math.round(((tempMetric.idealRange[0] + tempMetric.idealRange[1]) / 2) * 2) / 2;
    explanation.push({ code: "correctedTemperature", params: { value: `${temperatureC}°C` } });
  }

  let brewTimeSeconds = parseTimeToSeconds(input.brewTime);
  const timeMetric = metricByKey(metrics, "brewTime");
  if (timeMetric && NEEDS_CORRECTION.has(timeMetric.status) && timeMetric.idealRange) {
    brewTimeSeconds = Math.round((timeMetric.idealRange[0] + timeMetric.idealRange[1]) / 2);
    explanation.push({ code: "correctedBrewTime", params: { value: formatSeconds(brewTimeSeconds) } });
  }

  let waterG = input.waterG;
  const ratioMetric = metricByKey(metrics, "brewRatio");
  if (ratioMetric && NEEDS_CORRECTION.has(ratioMetric.status) && ratioMetric.idealRange && input.doseG) {
    const targetRatio = (ratioMetric.idealRange[0] + ratioMetric.idealRange[1]) / 2;
    waterG = Math.round(input.doseG * targetRatio);
    // Report the ratio actually implied by the rounded gram values, not the pre-rounding target, so the explanation always matches the suggested recipe exactly.
    explanation.push({ code: "correctedRatio", params: { value: `1:${formatRatio(waterG / input.doseG)}` } });
  }

  if (intent) {
    if (intent.wantsMoreExtraction) {
      grindScale = grindScale === null ? null : grindScale - 0.4;
      temperatureC = temperatureC === null ? null : temperatureC + 1;
      brewTimeSeconds = brewTimeSeconds === null ? null : Math.round(brewTimeSeconds * 1.1);
    }
    if (intent.wantsLessExtraction) {
      grindScale = grindScale === null ? null : grindScale + 0.4;
      temperatureC = temperatureC === null ? null : temperatureC - 1;
      brewTimeSeconds = brewTimeSeconds === null ? null : Math.round(brewTimeSeconds * 0.9);
    }
    if (intent.wantsBrighter) {
      grindScale = grindScale === null ? null : grindScale + 0.2;
      temperatureC = temperatureC === null ? null : temperatureC - 0.5;
    }
    if (intent.wantsSmoother) {
      grindScale = grindScale === null ? null : grindScale - 0.2;
      temperatureC = temperatureC === null ? null : temperatureC + 0.5;
    }
    if (intent.wantsStronger && input.doseG) waterG = waterG === null ? null : Math.round(waterG * 0.94);
    if (intent.wantsWeaker && input.doseG) waterG = waterG === null ? null : Math.round(waterG * 1.06);
    if (intent.matched) explanation.push({ code: "notesPreference" });
  }

  if (grindScale !== null && grindMetric && (NEEDS_CORRECTION.has(grindMetric.status) || intent?.matched)) {
    explanation.push({ code: "correctedGrind", params: { value: scaleToGrindLabel(clamp(grindScale, 1, 7)) } });
  }

  if (explanation.length === 0) explanation.push({ code: "withinIdealRange" });

  const providedFields = [input.doseG, input.waterG, input.temperatureC, input.grindSize, input.brewTime].filter(
    (value) => value !== null && value !== undefined && value !== "",
  ).length;
  if (providedFields < 3) explanation.push({ code: "missingData" });

  return {
    suggestedRecipe: {
      device: input.device,
      brewMethod: input.brewMethod,
      doseG: input.doseG,
      waterG,
      ratioDisplay: input.doseG && waterG ? `1:${formatRatio(waterG / input.doseG)}` : null,
      grindSize: grindScale === null ? input.grindSize : scaleToGrindLabel(clamp(grindScale, 1, 7)),
      temperatureC,
      brewTimeDisplay: brewTimeSeconds === null ? input.brewTime : formatSeconds(brewTimeSeconds),
    },
    explanation,
  };
}

function contextFlavors(input: CoachToolInput): FlavorNoteCode[] {
  const flavors: FlavorNoteCode[] = [];
  if (input.roastLevel) flavors.push(...ROAST_FLAVORS[input.roastLevel]);
  if (input.process) flavors.push(...PROCESS_FLAVORS[input.process]);
  flavors.push(...originFlavors(input.origin));
  return flavors;
}

/** Flavor codes implied by the diagnosis itself (e.g. an over-extracted brew tastes bitter regardless of origin) -- layered on top of `contextFlavors`. */
function diagnosisFlavors(metrics: CoachMetricEvaluation[]): FlavorNoteCode[] {
  const flavors: FlavorNoteCode[] = [];
  const extraction = metricByKey(metrics, "extraction");
  if (extraction?.value === "Over-extraction risk") flavors.push("bitter");
  if (extraction?.value === "Under-extraction risk") flavors.push("sour", "flat");

  const bitterness = metricByKey(metrics, "bitterness");
  if (bitterness && bitterness.rawValue !== null && bitterness.rawValue >= 7) flavors.push("bitter");

  const balance = metricByKey(metrics, "balance");
  if (balance && NEEDS_CORRECTION.has(balance.status)) flavors.push("muddy");

  return flavors;
}

function dedupeFlavors(flavors: FlavorNoteCode[], limit = 5): FlavorNoteCode[] {
  return [...new Set(flavors)].slice(0, limit);
}

function intentFlavors(intent: NotesIntent): FlavorNoteCode[] {
  const flavors: FlavorNoteCode[] = [];
  if (intent.wantsSweeter) flavors.push("caramel", "syrupy");
  if (intent.wantsBrighter) flavors.push("bright", "citrus");
  if (intent.wantsSmoother) flavors.push("clean", "balanced");
  return flavors;
}

/** Diagnose Brew: evaluates an actual brewed recipe against the Coach's 15-metric engine and suggests the corrected version. */
export function diagnoseBrew(input: CoachToolInput): CoachToolResult {
  const analysis = analyzeRecipeForCoaching(toCoachAnalysisInput(input));
  const { suggestedRecipe, explanation } = correctTowardIdeal(input, analysis.metrics, null);

  if (input.roastLevel) explanation.push({ code: `roastLevel${capitalize(input.roastLevel)}` as ExplanationPoint["code"] });
  if (input.process) explanation.push({ code: `process${capitalize(input.process)}` as ExplanationPoint["code"] });

  const flavorPrediction = dedupeFlavors([...contextFlavors(input), ...diagnosisFlavors(analysis.metrics)]);

  return {
    tool: "diagnose",
    suggestedRecipe,
    explanation,
    // `analysis.confidence` already reflects how much real recipe data was scoreable -- no need to recompute.
    confidence: analysis.confidence.level,
    flavorPrediction,
  };
}

/** Improve Recipe: same correction logic as Diagnose Brew, but the user's free-text notes are also treated as an explicit directional preference. */
export function improveRecipe(input: CoachToolInput): CoachToolResult {
  const analysis = analyzeRecipeForCoaching(toCoachAnalysisInput(input));
  const intent = sniffNotes(input.notes);
  const { suggestedRecipe, explanation } = correctTowardIdeal(input, analysis.metrics, intent);

  if (input.roastLevel) explanation.push({ code: `roastLevel${capitalize(input.roastLevel)}` as ExplanationPoint["code"] });
  if (input.process) explanation.push({ code: `process${capitalize(input.process)}` as ExplanationPoint["code"] });

  const flavorPrediction = dedupeFlavors([
    ...intentFlavors(intent),
    ...contextFlavors(input),
    ...diagnosisFlavors(analysis.metrics),
  ]);

  return {
    tool: "improve",
    suggestedRecipe,
    explanation,
    confidence: analysis.confidence.level,
    flavorPrediction,
  };
}

/** Generate Recipe: builds a brand-new recipe from a device's own realistic baseline (`DEVICE_RULES`), nudged by roast/process/notes -- no existing numbers required. */
export function generateRecipe(input: CoachToolInput): CoachToolResult {
  const brewMethodText = input.brewMethod ?? input.device ?? "V60";
  const methodId = resolveBrewMethod(brewMethodText);
  const rule = DEVICE_RULES[methodId];
  const profile = rule.profile;
  const intent = sniffNotes(input.notes);

  let grindIndex = (profile.grind.min + profile.grind.max) / 2;
  let temperatureC = profile.temperatureC.default;
  let ratio = profile.ratio.default;
  let brewTimeSeconds = profile.brewTimeSeconds.default;

  const explanation: ExplanationPoint[] = [{ code: "deviceBaseline", params: { device: brewMethodText } }];

  if (input.roastLevel === "light") {
    temperatureC += 1;
  } else if (input.roastLevel === "dark") {
    temperatureC -= 2;
    grindIndex += 0.3;
    ratio -= 0.5;
  } else if (input.roastLevel === "mediumDark") {
    temperatureC -= 1;
    ratio -= 0.25;
  }
  if (input.roastLevel) explanation.push({ code: `roastLevel${capitalize(input.roastLevel)}` as ExplanationPoint["code"] });

  if (input.process === "natural") {
    temperatureC -= 1;
    grindIndex += 0.2;
    brewTimeSeconds += 10;
  } else if (input.process === "honey") {
    grindIndex -= 0.2;
    brewTimeSeconds += 10;
  } else if (input.process === "anaerobic") {
    temperatureC -= 1;
    grindIndex += 0.2;
  }
  if (input.process) explanation.push({ code: `process${capitalize(input.process)}` as ExplanationPoint["code"] });

  if (intent.wantsMoreExtraction) {
    grindIndex -= 0.3;
    brewTimeSeconds += 10;
  }
  if (intent.wantsLessExtraction) {
    grindIndex += 0.3;
    brewTimeSeconds -= 10;
  }
  if (intent.wantsStronger) ratio -= 0.5;
  if (intent.wantsWeaker) ratio += 0.5;
  if (intent.matched) explanation.push({ code: "notesPreference" });

  grindIndex = clamp(grindIndex, profile.grind.min, profile.grind.max);
  temperatureC = clamp(temperatureC, profile.temperatureC.min, profile.temperatureC.max);
  ratio = clamp(ratio, profile.ratio.min, profile.ratio.max);
  brewTimeSeconds = clamp(brewTimeSeconds, profile.brewTimeSeconds.min, profile.brewTimeSeconds.max);

  const doseG = input.doseG ?? profile.defaultDoseG;
  const waterG = Math.round(doseG * ratio);

  const relevantFields: (keyof CoachToolInput)[] = ["brewMethod", "device", "origin", "roastLevel", "process"];
  const providedCount = relevantFields.filter((field) => {
    const value = input[field];
    return value !== null && value !== undefined && value !== "";
  }).length;
  if (providedCount < 3) explanation.push({ code: "missingData" });

  const flavorPrediction = dedupeFlavors([...intentFlavors(intent), ...contextFlavors(input)]);

  return {
    tool: "generate",
    suggestedRecipe: {
      device: input.device ?? brewMethodText,
      brewMethod: brewMethodText,
      doseG: Math.round(doseG),
      waterG,
      ratioDisplay: `1:${formatRatio(ratio)}`,
      grindSize: grindIndexToResult(grindIndex).display,
      temperatureC: Math.round(temperatureC),
      brewTimeDisplay: formatSecondsAsDuration(brewTimeSeconds),
    },
    explanation,
    confidence: computeConfidence(providedCount, relevantFields.length),
    flavorPrediction,
  };
}

function capitalize<T extends string>(value: T): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Dispatches to the right pure tool function -- the only thing `lib/ai/coach-tools-adapter.ts`'s mock adapter needs to call. */
export function runCoachTool(tool: "diagnose" | "generate" | "improve", input: CoachToolInput): CoachToolResult {
  if (tool === "diagnose") return diagnoseBrew(input);
  if (tool === "generate") return generateRecipe(input);
  return improveRecipe(input);
}
