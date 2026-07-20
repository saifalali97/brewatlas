import { analyzeBrewSession, formatSessionAnalyzerResponse } from "@/lib/ai/session-analyzer-engine";
import { buildBrewingSetupCoachContext } from "@/lib/ai/brewing-setup-coach";
import type { BrewSessionDetail } from "@/types/brew-sessions";
import type { UserBrewingSetup } from "@/types/brewing-setup";
import type { SessionAnalyzerResult } from "@/types/ai-coach-module";

export type BrewSessionAnalysisInput = {
  session: BrewSessionDetail;
  setup: UserBrewingSetup | null;
  similarSessions: Array<Pick<BrewSessionDetail, "coffeeName" | "rating" | "temperature" | "brewMethod" | "grinder" | "origin" | "processing">>;
  recipeTitle?: string | null;
  aiEnabled: boolean;
};

export type BrewSessionAnalysisResult = {
  summary: string;
  strengths: string;
  weaknesses: string;
  recommendations: string;
  markdown: string;
};

function parseBrewTimeSeconds(value: string | null): number | null {
  if (!value) return null;
  const parts = value.split(":").map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function detectTrends(input: BrewSessionAnalysisInput): string[] {
  const trends: string[] = [];
  const { session, similarSessions } = input;

  const ratedSimilar = similarSessions.filter((item) => item.rating != null);
  if (ratedSimilar.length >= 2 && session.temperature != null) {
    const highTemp = ratedSimilar.filter((item) => (item.temperature ?? 0) >= session.temperature!);
    const lowTemp = ratedSimilar.filter((item) => (item.temperature ?? 999) <= session.temperature!);
    const highAvg = highTemp.reduce((sum, item) => sum + (item.rating ?? 0), 0) / Math.max(highTemp.length, 1);
    const lowAvg = lowTemp.reduce((sum, item) => sum + (item.rating ?? 0), 0) / Math.max(lowTemp.length, 1);
    if (highTemp.length >= 2 && highAvg > lowAvg + 0.5) {
      trends.push(`You consistently achieve better results around ${session.temperature}°C.`);
    }
  }

  if (session.processing && session.origin?.toLowerCase().includes("ethiopia") && session.processing.toLowerCase().includes("washed")) {
    const washedEthiopians = similarSessions.filter(
      (item) =>
        item.origin?.toLowerCase().includes("ethiopia") &&
        item.processing?.toLowerCase().includes("washed") &&
        item.rating != null &&
        item.rating <= 3,
    );
    if (washedEthiopians.length >= 2) {
      trends.push("You tend to over-extract washed Ethiopian coffees.");
    }
  }

  if (session.grinder && session.brewMethod) {
    const grinderMatches = similarSessions.filter(
      (item) => item.grinder === session.grinder && item.brewMethod === session.brewMethod && item.rating != null,
    );
    if (grinderMatches.length >= 2) {
      const avg = grinderMatches.reduce((sum, item) => sum + (item.rating ?? 0), 0) / grinderMatches.length;
      if (avg >= 4) {
        trends.push(`You score ${session.brewMethod} recipes highest using your ${session.grinder} grinder.`);
      }
    }
  }

  return trends;
}

function buildStrengths(result: SessionAnalyzerResult, input: BrewSessionAnalysisInput): string {
  const items: string[] = [];
  if (input.session.rating != null && input.session.rating >= 4) {
    items.push(`Strong overall rating (${input.session.rating}/5).`);
  }
  if (result.balance.toLowerCase().includes("well balanced")) {
    items.push(result.balance.replace(/\*\*/g, ""));
  }
  if (input.session.tds != null && input.session.tds >= 1.15 && input.session.tds <= 1.45) {
    items.push(`TDS ${input.session.tds}% sits in a typical specialty range.`);
  }
  if (input.session.yieldAmount != null && input.session.dose != null) {
    const ratio = input.session.yieldAmount / input.session.dose;
    if (ratio >= 15 && ratio <= 17) items.push(`Ratio 1:${ratio.toFixed(1)} is within a balanced window.`);
  }
  if (items.length === 0) items.push("Session logged with enough detail to track improvements over time.");
  return items.join(" ");
}

function buildWeaknesses(result: SessionAnalyzerResult, input: BrewSessionAnalysisInput): string {
  const items: string[] = [];
  if (input.session.rating != null && input.session.rating <= 2) {
    items.push(`Low session rating (${input.session.rating}/5) suggests room for adjustment.`);
  }
  if (result.extraction.toLowerCase().includes("over-extracted")) {
    items.push("Likely over-extraction based on parameters and notes.");
  }
  if (result.extraction.toLowerCase().includes("under-extracted")) {
    items.push("Likely under-extraction based on parameters and notes.");
  }
  if (input.session.tds != null && (input.session.tds < 1.0 || input.session.tds > 1.6)) {
    items.push(`TDS ${input.session.tds}% is outside the typical 1.15–1.45% window.`);
  }
  if (items.length === 0) items.push("No major weaknesses detected — refine one variable at a time to improve further.");
  return items.join(" ");
}

/** Generates brew session AI analysis using the session analyzer engine plus trend detection. */
export function analyzeBrewSessionJournal(input: BrewSessionAnalysisInput): BrewSessionAnalysisResult | null {
  if (!input.aiEnabled || !input.session.dose) return null;

  const base = analyzeBrewSession({
    doseG: input.session.dose,
    yieldG: input.session.yieldAmount,
    timeSeconds: parseBrewTimeSeconds(input.session.brewTime),
    grindSize: input.session.grinderSetting,
    temperatureC: input.session.temperature,
    flavorNotes: input.session.notes,
    method: input.session.brewMethod,
  });

  const setupContext = buildBrewingSetupCoachContext(input.setup);
  const trends = detectTrends(input);
  const strengths = buildStrengths(base, input);
  const weaknesses = buildWeaknesses(base, input);
  const recommendations = [...base.recommendations, ...trends].join(" ");

  const summaryParts = [
    base.summary,
    input.recipeTitle ? `Recipe: ${input.recipeTitle}.` : null,
    input.session.coffeeName ? `Coffee: ${input.session.coffeeName}.` : null,
  ].filter(Boolean);

  const markdown = [
    "## Brew Session Analysis",
    summaryParts.join(" "),
    "",
    "### Strengths",
    strengths,
    "",
    "### Weaknesses",
    weaknesses,
    "",
    "### Extraction",
    base.extraction.replace(/\*\*/g, ""),
    "",
    "### Recommendations",
    recommendations,
    setupContext ? `\n### Your Setup\n${setupContext}` : "",
    formatSessionAnalyzerResponse(base),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    summary: summaryParts.join(" "),
    strengths,
    weaknesses,
    recommendations,
    markdown,
  };
}
