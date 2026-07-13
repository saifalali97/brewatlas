import type { MethodProfile } from "@/lib/intelligence/recipe-analysis";
import { formatSeconds, round1 } from "@/lib/ai/coach-utils";
import type {
  CoachAnalysisInput,
  CoachMessage,
  CoachMetricEvaluation,
  CoachMetricKey,
} from "@/types/coach";
import type { BeverageStrength, ExtractionRisk } from "@/types/intelligence";

/**
 * Coaching copy generation for the AI Coach (requirement 3): turns the
 * scored `CoachMetricEvaluation`s from `lib/ai/coach-engine.ts` into the
 * plain-language messages, strengths, weaknesses, and suggestions a
 * barista would actually say -- e.g. "This grind is slightly too fine.",
 * "Increase bloom to 45 seconds.", "Reduce water temperature by 2°C.".
 *
 * Kept in its own file (rather than folded into the engine) purely for
 * readability -- there's a template function per metric below. Nothing
 * here is randomized or LLM-generated; every string is built from the
 * metric's own `rawValue`/`idealRange`, so it's exactly reproducible.
 */

type FeedbackResult = {
  message?: CoachMessage;
  strength?: string;
  weakness?: string;
  suggestion?: string;
};

type FeedbackContext = {
  input: CoachAnalysisInput;
  profile: MethodProfile;
  metrics: CoachMetricEvaluation[];
  extractionRisk: ExtractionRisk | null;
  beverageStrength: BeverageStrength | null;
  sensory: { sweetness: number; acidity: number; body: number; bitterness: number; clarity: number };
};

function positive(metric: CoachMetricKey, message: string): FeedbackResult {
  return { message: { metric, severity: "positive", message }, strength: message };
}

function getMetric(metrics: CoachMetricEvaluation[], key: CoachMetricKey): CoachMetricEvaluation {
  const metric = metrics.find((entry) => entry.key === key);
  if (!metric) throw new Error(`Missing evaluated metric: ${key}`);
  return metric;
}

function brewRatioFeedback(metric: CoachMetricEvaluation, methodLabel: string): FeedbackResult | null {
  if (metric.rawValue === null || metric.idealRange === null) return null;
  const [min, max] = metric.idealRange;
  if (metric.rawValue >= min && metric.rawValue <= max) {
    return positive("brewRatio", `Your brew ratio is right in the ideal range for ${methodLabel}.`);
  }

  const weaker = metric.rawValue > max;
  const target = round1((min + max) / 2);
  const message = weaker
    ? `Your brew ratio is weaker than typical for ${methodLabel}.`
    : `Your brew ratio is stronger than typical for ${methodLabel}.`;
  return {
    message: { metric: "brewRatio", severity: metric.status === "poor" ? "critical" : "warning", message },
    weakness: message,
    suggestion: `Try a ratio closer to 1:${target}.`,
  };
}

function extractionFeedback(extractionRisk: ExtractionRisk | null): FeedbackResult | null {
  if (!extractionRisk) return null;
  if (extractionRisk === "Balanced") {
    return positive("extraction", "Extraction signals point to a well-balanced cup.");
  }

  const isOver = extractionRisk === "Over-extraction risk";
  const message = isOver
    ? "Signals point to an over-extraction risk -- likely bitter or harsh."
    : "Signals point to an under-extraction risk -- likely sour or weak.";
  return {
    message: { metric: "extraction", severity: "warning", message },
    weakness: message,
    suggestion: isOver ? "Try a coarser grind or a slightly cooler water temperature." : "Try a finer grind or a slightly hotter water temperature.",
  };
}

function grindSizeFeedback(metric: CoachMetricEvaluation, methodLabel: string): FeedbackResult | null {
  if (metric.rawValue === null || metric.idealRange === null) return null;
  const [min, max] = metric.idealRange;
  if (metric.rawValue >= min && metric.rawValue <= max) {
    return positive("grindSize", `Grind size is well matched to ${methodLabel}.`);
  }

  const tooFine = metric.rawValue < min;
  const severityWord = metric.status === "poor" ? "much" : "slightly";
  const message = tooFine
    ? `This grind is ${severityWord} too fine for ${methodLabel}.`
    : `This grind is ${severityWord} too coarse for ${methodLabel}.`;
  return {
    message: { metric: "grindSize", severity: metric.status === "poor" ? "critical" : "warning", message },
    weakness: message,
    suggestion: tooFine ? "Try a coarser grind." : "Try a finer grind.",
  };
}

function bloomFeedback(metric: CoachMetricEvaluation, methodLabel: string): FeedbackResult | null {
  if (metric.rawValue === null || metric.idealRange === null) return null;
  const [min, max] = metric.idealRange;
  if (metric.rawValue >= min && metric.rawValue <= max) {
    return positive("bloom", `Bloom time is well dialed in for ${methodLabel}.`);
  }

  const short = metric.rawValue < min;
  const target = Math.round((min + max) / 2);
  const message = short ? `Your bloom is shorter than ideal for ${methodLabel}.` : `Your bloom is longer than ideal for ${methodLabel}.`;
  return {
    message: { metric: "bloom", severity: "info", message },
    weakness: message,
    suggestion: short ? `Increase bloom to ${target} seconds.` : `Reduce bloom to ${target} seconds.`,
  };
}

function waterTemperatureFeedback(metric: CoachMetricEvaluation, methodLabel: string): FeedbackResult | null {
  if (metric.rawValue === null || metric.idealRange === null) return null;
  const [min, max] = metric.idealRange;
  if (metric.rawValue >= min && metric.rawValue <= max) {
    return positive("waterTemperature", `Water temperature is perfectly dialed in for ${methodLabel}.`);
  }

  const above = metric.rawValue > max;
  const delta = Math.round(Math.abs(above ? metric.rawValue - max : min - metric.rawValue));
  const message = above
    ? `Water temperature is above the ideal range for ${methodLabel}.`
    : `Water temperature is below the ideal range for ${methodLabel}.`;
  return {
    message: { metric: "waterTemperature", severity: metric.status === "poor" ? "critical" : "warning", message },
    weakness: message,
    suggestion: above ? `Reduce water temperature by ${delta}°C.` : `Increase water temperature by ${delta}°C.`,
  };
}

function pouringStructureFeedback(metric: CoachMetricEvaluation, methodLabel: string): FeedbackResult | null {
  if (metric.rawValue === null || metric.idealRange === null) return null;
  const [min, max] = metric.idealRange;
  if (metric.rawValue >= min && metric.rawValue <= max) {
    return positive("pouringStructure", `Pouring structure is well suited to ${methodLabel}.`);
  }

  const tooFew = metric.rawValue < min;
  const message = tooFew
    ? `Try breaking the pour into more stages for ${methodLabel}.`
    : `Consider fewer, larger pours for ${methodLabel}.`;
  return {
    message: { metric: "pouringStructure", severity: "info", message },
    weakness: message,
    suggestion: tooFew ? `Add more structured pours (aim for ${min}-${max}).` : `Reduce to ${min}-${max} pours.`,
  };
}

function brewTimeFeedback(metric: CoachMetricEvaluation, methodLabel: string): FeedbackResult | null {
  if (metric.rawValue === null || metric.idealRange === null) return null;
  const [min, max] = metric.idealRange;
  if (metric.rawValue >= min && metric.rawValue <= max) {
    return positive("brewTime", `Total brew time is well matched to ${methodLabel}.`);
  }

  const short = metric.rawValue < min;
  const message = short ? `Brew time is shorter than typical for ${methodLabel}.` : `Brew time is longer than typical for ${methodLabel}.`;
  return {
    message: { metric: "brewTime", severity: "info", message },
    weakness: message,
    suggestion: `Aim for a total brew time between ${formatSeconds(min)} and ${formatSeconds(max)}.`,
  };
}

function agitationFeedback(metric: CoachMetricEvaluation, methodLabel: string): FeedbackResult | null {
  if (metric.score === null) return null;
  if (metric.value === "Gentle" || metric.status === "excellent" || metric.status === "good") {
    return metric.value === "Gentle" ? positive("agitation", `Agitation is well controlled for ${methodLabel}.`) : null;
  }

  const message = `${methodLabel} typically favors gentle handling; the recorded agitation is more vigorous than ideal.`;
  return {
    message: { metric: "agitation", severity: "warning", message },
    weakness: message,
    suggestion: "Reduce agitation -- pour and stir gently.",
  };
}

function strengthFeedback(beverageStrength: BeverageStrength | null, methodLabel: string): FeedbackResult | null {
  if (!beverageStrength) return null;
  if (beverageStrength === "Balanced") {
    return positive("strength", "This recipe brews a balanced-strength cup.");
  }

  const message = `This recipe brews on the ${beverageStrength.toLowerCase()} side for ${methodLabel}.`;
  return { message: { metric: "strength", severity: "info", message }, weakness: message };
}

function bitternessFeedback(metric: CoachMetricEvaluation): FeedbackResult | null {
  if (metric.status === "excellent" || metric.status === "good" || metric.score === null) return null;

  const message = "Predicted bitterness is higher than ideal, likely from over-extraction.";
  return {
    message: { metric: "bitterness", severity: "warning", message },
    weakness: message,
    suggestion: "Try a coarser grind or a slightly cooler water temperature to tame bitterness.",
  };
}

function balanceFeedback(metric: CoachMetricEvaluation): FeedbackResult | null {
  if (metric.score === null) return null;
  if (metric.status === "excellent") {
    return positive("balance", "The predicted flavor profile is well balanced -- no single attribute dominates.");
  }
  if (metric.status === "good") return null;

  const message = "The predicted flavor profile is imbalanced -- one attribute (sweetness, acidity, bitterness, or body) may dominate the cup.";
  return {
    message: { metric: "balance", severity: "info", message },
    weakness: message,
    suggestion: "Dial in grind size and ratio together for a more harmonious cup.",
  };
}

/** Bonus "delight" messages (requirement 3 example: "Your recipe is ideal for fruity coffees.") triggered when the predicted sensory profile and roast/process combine into a recognizable, well-loved style. */
function compositeDelightMessages(input: CoachAnalysisInput, sensory: FeedbackContext["sensory"]): CoachMessage[] {
  const messages: CoachMessage[] = [];
  const roast = (input.roastLevel ?? "").toLowerCase();
  const process = (input.process ?? "").toLowerCase();

  if (sensory.acidity >= 7 && sensory.clarity >= 7) {
    messages.push({ metric: "acidity", severity: "positive", message: "Your recipe is ideal for fruity coffees." });
  }

  if (sensory.body >= 7 && sensory.sweetness >= 7 && roast.includes("dark")) {
    messages.push({ metric: "body", severity: "positive", message: "Your recipe is ideal for chocolatey, full-bodied coffees." });
  }

  if (process.includes("washed") && sensory.clarity >= 7) {
    messages.push({ metric: "clarity", severity: "positive", message: "Your recipe is ideal for clean, washed-process coffees." });
  }

  if (process.includes("natural") && sensory.sweetness >= 7) {
    messages.push({ metric: "sweetness", severity: "positive", message: "Your recipe is ideal for naturally sweet, fermented-forward coffees." });
  }

  return messages;
}

const FEEDBACK_METRICS: CoachMetricKey[] = [
  "brewRatio",
  "extraction",
  "grindSize",
  "bloom",
  "waterTemperature",
  "pouringStructure",
  "brewTime",
  "agitation",
  "strength",
  "bitterness",
  "balance",
];

/**
 * Runs every per-metric feedback template plus the composite "delight"
 * rules, and folds the results into the flat `messages`/`strengths`/
 * `weaknesses`/`suggestions` arrays `CoachAnalysisResult` exposes.
 */
export function generateCoachFeedback(ctx: FeedbackContext): {
  messages: CoachMessage[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
} {
  const methodLabel = ctx.input.brewingMethodName ?? "this brewing method";
  const messages: CoachMessage[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  const feedbackByMetric: Record<CoachMetricKey, () => FeedbackResult | null> = {
    brewRatio: () => brewRatioFeedback(getMetric(ctx.metrics, "brewRatio"), methodLabel),
    extraction: () => extractionFeedback(ctx.extractionRisk),
    grindSize: () => grindSizeFeedback(getMetric(ctx.metrics, "grindSize"), methodLabel),
    bloom: () => bloomFeedback(getMetric(ctx.metrics, "bloom"), methodLabel),
    waterTemperature: () => waterTemperatureFeedback(getMetric(ctx.metrics, "waterTemperature"), methodLabel),
    pouringStructure: () => pouringStructureFeedback(getMetric(ctx.metrics, "pouringStructure"), methodLabel),
    brewTime: () => brewTimeFeedback(getMetric(ctx.metrics, "brewTime"), methodLabel),
    agitation: () => agitationFeedback(getMetric(ctx.metrics, "agitation"), methodLabel),
    strength: () => strengthFeedback(ctx.beverageStrength, methodLabel),
    bitterness: () => bitternessFeedback(getMetric(ctx.metrics, "bitterness")),
    balance: () => balanceFeedback(getMetric(ctx.metrics, "balance")),
    // Purely descriptive metrics don't get pass/fail coaching copy -- see COACH_METRIC_STYLES.
    clarity: () => null,
    sweetness: () => null,
    acidity: () => null,
    body: () => null,
  };

  for (const key of FEEDBACK_METRICS) {
    const result = feedbackByMetric[key]();
    if (!result) continue;
    if (result.message) messages.push(result.message);
    if (result.strength) strengths.push(result.strength);
    if (result.weakness) weaknesses.push(result.weakness);
    if (result.suggestion) suggestions.push(result.suggestion);
  }

  for (const message of compositeDelightMessages(ctx.input, ctx.sensory)) {
    messages.push(message);
    strengths.push(message.message);
  }

  return { messages, strengths, weaknesses, suggestions };
}
