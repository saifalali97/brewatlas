import {
  ENGINE_VERSION as INTELLIGENCE_ENGINE_VERSION,
  calcBeverageStrength,
  calcBrewRatio,
  calcExpectedSensoryProfile,
  calcExtractionRisk,
  getMethodProfile,
  grindSizeToScale,
  isHighAgitation,
  parseTimeToSeconds,
  type MethodProfile,
} from "@/lib/intelligence/recipe-analysis";
import { generateCoachFeedback } from "@/lib/ai/coach-messages";
import {
  clamp,
  formatSeconds,
  grindRangeLabel,
  METRIC_LABELS,
  round1,
  scoreCeiling,
  scoreWithinRange,
  statusFromScore,
} from "@/lib/ai/coach-utils";
import type {
  CoachAnalysisInput,
  CoachAnalysisResult,
  CoachConfidence,
  CoachConfidenceLevel,
  CoachMetricEvaluation,
  CoachMetricKey,
} from "@/types/coach";
import { COACH_METRIC_KEYS } from "@/types/coach";

/**
 * The BrewAtlas AI Coach engine: a pure, deterministic function that
 * evaluates a recipe across the 15 required metrics and produces a Brew
 * Score, confidence level, and coaching feedback.
 *
 * Deliberately built as an interpretation layer *on top of* the Recipe
 * Intelligence Engine (`lib/intelligence/recipe-analysis.ts`) rather than
 * a parallel implementation -- brew ratio, extraction risk, and the
 * expected sensory profile are computed once, by one engine, everywhere
 * in BrewAtlas. See requirement 9 ("create reusable AI models only").
 *
 * No I/O, no Supabase, no external API calls (requirement 14) -- see
 * `lib/data/ai-coach.ts` for the Supabase-backed orchestration on top of
 * this, and `lib/ai/coach-adapter.ts` for the (also call-free) future-LLM
 * adapter.
 */
export const COACH_ENGINE_VERSION = "1.0";

/** Relative weight of each metric in the composite Brew Score -- process metrics that most directly drive cup quality count more than purely descriptive ones. */
const METRIC_WEIGHTS: Record<CoachMetricKey, number> = {
  brewRatio: 12,
  extraction: 12,
  grindSize: 10,
  waterTemperature: 10,
  balance: 10,
  strength: 8,
  bitterness: 8,
  bloom: 6,
  pouringStructure: 6,
  brewTime: 6,
  agitation: 6,
  clarity: 2,
  sweetness: 2,
  acidity: 2,
  body: 2,
};

/** Typical total brew time envelope per method, in seconds -- mirrors the regex table shape of `METHOD_PROFILES` in the Intelligence Engine, kept local since brew time isn't part of that engine's output. */
const BREW_TIME_RANGES: { match: RegExp; range: [number, number] }[] = [
  { match: /espresso/i, range: [22, 32] },
  { match: /cold brew/i, range: [12 * 3600, 24 * 3600] },
  { match: /french press|clever|immersion/i, range: [240, 300] },
  { match: /aeropress/i, range: [90, 150] },
  { match: /siphon/i, range: [180, 240] },
];
const DEFAULT_BREW_TIME_RANGE: [number, number] = [150, 240];

function getBrewTimeRange(brewingMethodName: string | null): [number, number] {
  if (!brewingMethodName) return DEFAULT_BREW_TIME_RANGE;
  const match = BREW_TIME_RANGES.find((entry) => entry.match.test(brewingMethodName));
  return match?.range ?? DEFAULT_BREW_TIME_RANGE;
}

const POUR_COUNT_RANGE: [number, number] = [2, 4];

/** True for the pour-over method family (uses the Intelligence Engine's default profile), the only family where bloom/pouring-structure evaluation applies. */
function isPourOverFamily(profile: MethodProfile): boolean {
  return profile.bloomSecondsRange !== null;
}

function evalBrewRatio(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  const ratio = calcBrewRatio(input.coffeeDose, input.waterAmount);
  const score = ratio.value === null ? null : round1(scoreWithinRange(ratio.value, profile.ratioRange, 0.4));
  return {
    key: "brewRatio",
    label: METRIC_LABELS.brewRatio,
    style: "process",
    score,
    status: statusFromScore(score),
    value: ratio.display,
    target: `1:${profile.ratioRange[0]}-1:${profile.ratioRange[1]}`,
    rawValue: ratio.value,
    idealRange: profile.ratioRange,
    unit: null,
  };
}

function evalExtraction(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  const risk = calcExtractionRisk(input, profile);
  const score = risk === null ? null : risk === "Balanced" ? 95 : 50;
  return {
    key: "extraction",
    label: METRIC_LABELS.extraction,
    style: "process",
    score,
    status: statusFromScore(score),
    value: risk,
    target: "Balanced",
    rawValue: null,
    idealRange: null,
    unit: null,
  };
}

function evalGrindSize(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  const scale = grindSizeToScale(input.grindSize);
  const score = scale === null ? null : round1(scoreWithinRange(scale, profile.grindRange, 1.0));
  return {
    key: "grindSize",
    label: METRIC_LABELS.grindSize,
    style: "process",
    score,
    status: statusFromScore(score),
    value: input.grindSize,
    target: grindRangeLabel(profile.grindRange),
    rawValue: scale,
    idealRange: profile.grindRange,
    unit: null,
  };
}

function evalBloom(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  if (profile.bloomSecondsRange === null) {
    return {
      key: "bloom",
      label: METRIC_LABELS.bloom,
      style: "process",
      score: 100,
      status: "excellent",
      value: "Not applicable",
      target: `${input.brewingMethodName ?? "This method"} doesn't use a bloom step`,
      rawValue: null,
      idealRange: null,
      unit: "s",
    };
  }

  const seconds = parseTimeToSeconds(input.bloomTime);
  const score = seconds === null ? null : round1(scoreWithinRange(seconds, profile.bloomSecondsRange, 0.5));
  return {
    key: "bloom",
    label: METRIC_LABELS.bloom,
    style: "process",
    score,
    status: statusFromScore(score),
    value: input.bloomTime,
    target: `${profile.bloomSecondsRange[0]}-${profile.bloomSecondsRange[1]}s`,
    rawValue: seconds,
    idealRange: profile.bloomSecondsRange,
    unit: "s",
  };
}

function evalWaterTemperature(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  const temp = input.waterTemperature;
  const score = temp === null ? null : round1(scoreWithinRange(temp, profile.tempRangeC, 0.5));
  return {
    key: "waterTemperature",
    label: METRIC_LABELS.waterTemperature,
    style: "process",
    score,
    status: statusFromScore(score),
    value: temp === null ? null : `${temp}°C`,
    target: `${profile.tempRangeC[0]}-${profile.tempRangeC[1]}°C`,
    rawValue: temp,
    idealRange: profile.tempRangeC,
    unit: "°C",
  };
}

function evalPouringStructure(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  if (!isPourOverFamily(profile)) {
    return {
      key: "pouringStructure",
      label: METRIC_LABELS.pouringStructure,
      style: "process",
      score: 100,
      status: "excellent",
      value: "Not applicable",
      target: `${input.brewingMethodName ?? "This method"} doesn't use structured pours`,
      rawValue: null,
      idealRange: null,
      unit: null,
    };
  }

  const pourCount = input.pourCount;
  const score = pourCount === null ? null : round1(scoreWithinRange(pourCount, POUR_COUNT_RANGE, 0.5));
  return {
    key: "pouringStructure",
    label: METRIC_LABELS.pouringStructure,
    style: "process",
    score,
    status: statusFromScore(score),
    value: pourCount === null ? null : `${pourCount} pour${pourCount === 1 ? "" : "s"}`,
    target: `${POUR_COUNT_RANGE[0]}-${POUR_COUNT_RANGE[1]} pours`,
    rawValue: pourCount,
    idealRange: POUR_COUNT_RANGE,
    unit: null,
  };
}

function evalBrewTime(input: CoachAnalysisInput): CoachMetricEvaluation {
  const range = getBrewTimeRange(input.brewingMethodName);
  const seconds = parseTimeToSeconds(input.totalBrewTime);
  const score = seconds === null ? null : round1(scoreWithinRange(seconds, range, 0.3));
  return {
    key: "brewTime",
    label: METRIC_LABELS.brewTime,
    style: "process",
    score,
    status: statusFromScore(score),
    value: input.totalBrewTime,
    target: `${formatSeconds(range[0])}-${formatSeconds(range[1])}`,
    rawValue: seconds,
    idealRange: range,
    unit: "s",
  };
}

function evalAgitation(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  const signals = [input.agitation, input.brewProfileAgitation, input.xbloomAgitation, input.xbloomPulsePattern];
  const hasSignal = signals.some((signal) => signal !== null && signal !== undefined);

  if (!hasSignal) {
    return {
      key: "agitation",
      label: METRIC_LABELS.agitation,
      style: "process",
      score: null,
      status: "unknown",
      value: null,
      target: `${profile.agitationTolerance} tolerance for ${input.brewingMethodName ?? "this method"}`,
      rawValue: null,
      idealRange: null,
      unit: null,
    };
  }

  const high = isHighAgitation(input);
  const score = !high ? 95 : profile.agitationTolerance === "low" ? 40 : profile.agitationTolerance === "medium" ? 70 : 95;
  return {
    key: "agitation",
    label: METRIC_LABELS.agitation,
    style: "process",
    score,
    status: statusFromScore(score),
    value: high ? "Vigorous" : "Gentle",
    target: `${profile.agitationTolerance} tolerance for ${input.brewingMethodName ?? "this method"}`,
    rawValue: null,
    idealRange: null,
    unit: null,
  };
}

function evalStrength(input: CoachAnalysisInput, profile: MethodProfile): CoachMetricEvaluation {
  const ratio = calcBrewRatio(input.coffeeDose, input.waterAmount);
  const strength = calcBeverageStrength(ratio.value, profile);
  const score = ratio.value === null ? null : round1(scoreWithinRange(ratio.value, profile.ratioRange, 0.4));
  return {
    key: "strength",
    label: METRIC_LABELS.strength,
    style: "process",
    score,
    status: statusFromScore(score),
    value: strength,
    target: "Balanced",
    rawValue: ratio.value,
    idealRange: profile.ratioRange,
    unit: null,
  };
}

/** Heuristic 1-10 bitterness estimate -- the Intelligence Engine's `expected` profile doesn't include bitterness, so the Coach derives its own from the same signals (roast, process, extraction risk, temperature, grind). */
function estimateBitterness(input: CoachAnalysisInput, profile: MethodProfile, extractionRisk: ReturnType<typeof calcExtractionRisk>): number {
  let bitterness = 5;

  if (extractionRisk === "Over-extraction risk") bitterness += 2;
  if (extractionRisk === "Under-extraction risk") bitterness -= 1;

  const roast = (input.roastLevel ?? "").toLowerCase();
  if (roast.includes("dark")) bitterness += 1;
  if (roast.includes("light")) bitterness -= 1;

  if ((input.process ?? "").toLowerCase().includes("natural")) bitterness -= 1;

  if (input.waterTemperature !== null && input.waterTemperature > profile.tempRangeC[1]) bitterness += 1;

  const grindScale = grindSizeToScale(input.grindSize);
  if (grindScale !== null && grindScale < profile.grindRange[0]) bitterness += 1;

  return clamp(Math.round(bitterness), 1, 10);
}

function evalBitterness(input: CoachAnalysisInput, profile: MethodProfile, extractionRisk: ReturnType<typeof calcExtractionRisk>): { evaluation: CoachMetricEvaluation; value: number } {
  const value = input.actualBitterness ?? estimateBitterness(input, profile, extractionRisk);
  const score = round1(scoreCeiling(value, 6, 0.5));
  return {
    value,
    evaluation: {
      key: "bitterness",
      label: METRIC_LABELS.bitterness,
      style: "process",
      score,
      status: statusFromScore(score),
      value: `${value}/10`,
      target: "≤ 6/10 (avoid over-extraction bitterness)",
      rawValue: value,
      idealRange: [1, 6],
      unit: null,
    },
  };
}

function evalDescriptive(
  key: "clarity" | "sweetness" | "acidity" | "body",
  value: number,
): CoachMetricEvaluation {
  const score = round1(clamp(value * 10, 0, 100));
  return {
    key,
    label: METRIC_LABELS[key],
    style: "descriptive",
    score,
    status: "good",
    value: `${value}/10`,
    target: null,
    rawValue: value,
    idealRange: null,
    unit: null,
  };
}

function evalBalance(values: { sweetness: number; acidity: number; bitterness: number; body: number }): CoachMetricEvaluation {
  const numbers = Object.values(values);
  const spread = round1(Math.max(...numbers) - Math.min(...numbers));
  const score = round1(scoreCeiling(spread, 3, 1.0));
  return {
    key: "balance",
    label: METRIC_LABELS.balance,
    style: "process",
    score,
    status: statusFromScore(score),
    value: `Spread ${spread}/10`,
    target: "Spread ≤ 3/10 across sweetness, acidity, bitterness, body",
    rawValue: spread,
    idealRange: [0, 3],
    unit: null,
  };
}

function buildConfidence(metrics: CoachMetricEvaluation[]): CoachConfidence {
  const metricsTotal = COACH_METRIC_KEYS.length;
  const metricsScored = metrics.filter((metric) => metric.score !== null).length;
  const score = round1(metricsScored / metricsTotal);
  const level: CoachConfidenceLevel = score >= 0.8 ? "high" : score >= 0.5 ? "medium" : "low";
  return { level, score, metricsScored, metricsTotal };
}

function buildBrewScore(metrics: CoachMetricEvaluation[]): number {
  let weightedSum = 0;
  let weightTotal = 0;

  for (const metric of metrics) {
    if (metric.score === null) continue;
    const weight = METRIC_WEIGHTS[metric.key];
    weightedSum += metric.score * weight;
    weightTotal += weight;
  }

  if (weightTotal === 0) return 50;
  return Math.round(clamp(weightedSum / weightTotal, 0, 100));
}

/**
 * Runs the full AI Coach engine on a recipe's brewing parameters.
 * Deterministic and side-effect free -- see `lib/data/ai-coach.ts` for
 * how it's wired up to a real recipe and persisted for history.
 */
export function analyzeRecipeForCoaching(input: CoachAnalysisInput): CoachAnalysisResult {
  const profile = getMethodProfile(input.brewingMethodName);
  const extractionRisk = calcExtractionRisk(input, profile);
  const beverageStrength = calcBeverageStrength(calcBrewRatio(input.coffeeDose, input.waterAmount).value, profile);
  const expected = calcExpectedSensoryProfile(input, profile);

  const sweetness = input.actualSweetness ?? expected.sweetness;
  const acidity = input.actualAcidity ?? expected.acidity;
  const body = input.actualBody ?? expected.body;
  const { evaluation: bitternessEvaluation, value: bitterness } = evalBitterness(input, profile, extractionRisk);

  const metrics: CoachMetricEvaluation[] = [
    evalBrewRatio(input, profile),
    evalExtraction(input, profile),
    evalGrindSize(input, profile),
    evalBloom(input, profile),
    evalWaterTemperature(input, profile),
    evalPouringStructure(input, profile),
    evalBrewTime(input),
    evalAgitation(input, profile),
    evalStrength(input, profile),
    evalDescriptive("clarity", expected.clarity),
    evalDescriptive("sweetness", sweetness),
    evalDescriptive("acidity", acidity),
    bitternessEvaluation,
    evalDescriptive("body", body),
    evalBalance({ sweetness, acidity, bitterness, body }),
  ];

  const { messages, strengths, weaknesses, suggestions } = generateCoachFeedback({
    input,
    profile,
    metrics,
    extractionRisk,
    beverageStrength,
    sensory: { sweetness, acidity, body, bitterness, clarity: expected.clarity },
  });

  return {
    engineVersion: `coach-${COACH_ENGINE_VERSION}+intelligence-${INTELLIGENCE_ENGINE_VERSION}`,
    brewScore: buildBrewScore(metrics),
    confidence: buildConfidence(metrics),
    metrics,
    messages,
    strengths,
    weaknesses,
    suggestions,
    extractionRisk,
    beverageStrength,
  };
}
