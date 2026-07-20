import type { SessionAnalyzerInput, SessionAnalyzerResult } from "@/types/ai-coach-module";

function classifyExtraction(input: SessionAnalyzerInput): string {
  const flavor = (input.flavorNotes ?? "").toLowerCase();
  if (flavor.includes("bitter") || flavor.includes("harsh") || flavor.includes("astringent")) {
    return "Likely **over-extracted** — bitter, harsh, or drying flavors suggest too many compounds were dissolved.";
  }
  if (flavor.includes("sour") || flavor.includes("sharp") || flavor.includes("thin")) {
    return "Likely **under-extracted** — sour, sharp, or thin flavors suggest insufficient extraction.";
  }
  if (flavor.includes("sweet") || flavor.includes("balanced") || flavor.includes("clean")) {
    return "**Balanced extraction** — sweetness and clarity suggest you're near the sweet spot.";
  }

  if (input.timeSeconds && input.timeSeconds > 240) {
    return "Possibly **over-extracted** based on extended brew time — verify taste for bitterness.";
  }
  if (input.timeSeconds && input.timeSeconds < 120) {
    return "Possibly **under-extracted** based on short brew time — verify taste for sourness.";
  }

  return "Extraction level is **uncertain** without taste notes — describe what you taste for a more precise diagnosis.";
}

function classifyStrength(input: SessionAnalyzerInput): string {
  if (!input.yieldG) {
    return "Strength assessment requires yield — enter both dose and yield for TDS-based strength estimation.";
  }
  const ratio = input.yieldG / input.doseG;
  if (ratio < 14) return "**Strong** — tight ratio produces a concentrated cup.";
  if (ratio > 18) return "**Light** — wide ratio produces a lighter, more tea-like strength.";
  return "**Balanced strength** — ratio falls within a typical specialty range.";
}

function classifyBalance(input: SessionAnalyzerInput): string {
  const flavor = (input.flavorNotes ?? "").toLowerCase();
  const hasPositive = flavor.includes("sweet") || flavor.includes("balanced") || flavor.includes("clean");
  const hasNegative = flavor.includes("bitter") || flavor.includes("sour") || flavor.includes("harsh");

  if (hasPositive && !hasNegative) return "**Well balanced** — positive flavor descriptors without harshness.";
  if (hasNegative) return "**Imbalanced** — one or more off-flavors detected. See recommendations below.";
  return "**Balance unclear** — add flavor notes (sweet, sour, bitter, etc.) for a better assessment.";
}

function buildRecommendations(input: SessionAnalyzerInput): string[] {
  const recs: string[] = [];
  const flavor = (input.flavorNotes ?? "").toLowerCase();

  if (flavor.includes("sour")) {
    recs.push("Grind 1–2 steps finer or raise temperature 1°C");
    recs.push("Extend brew time slightly if drawdown allows");
  }
  if (flavor.includes("bitter")) {
    recs.push("Grind 1–2 steps coarser or lower temperature 1°C");
    recs.push("Reduce agitation and check for channeling");
  }
  if (flavor.includes("weak") || flavor.includes("thin")) {
    recs.push("Increase dose or tighten ratio");
  }
  if (flavor.includes("strong")) {
    recs.push("Decrease dose or widen ratio");
  }
  if (input.grindSize?.toLowerCase().includes("fine") && flavor.includes("bitter")) {
    recs.push("Your grind may be too fine — try one step coarser");
  }
  if (recs.length === 0) {
    recs.push("Log taste notes after each brew to track improvements over time");
    recs.push("Change one variable at a time when dialing in");
  }
  return recs;
}

/** Analyzes a brew session from dose, yield, time, and flavor notes. */
export function analyzeBrewSession(input: SessionAnalyzerInput): SessionAnalyzerResult {
  const extraction = classifyExtraction(input);
  const strength = classifyStrength(input);
  const balance = classifyBalance(input);
  const recommendations = buildRecommendations(input);

  const ratioStr = input.yieldG ? `1:${(input.yieldG / input.doseG).toFixed(1)}` : "unknown";

  return {
    extraction,
    strength,
    balance,
    recommendations,
    summary: `**Dose:** ${input.doseG}g · **Yield:** ${input.yieldG ?? "—"}g · **Ratio:** ${ratioStr}${input.timeSeconds ? ` · **Time:** ${Math.floor(input.timeSeconds / 60)}:${String(input.timeSeconds % 60).padStart(2, "0")}` : ""}`,
  };
}

export function formatSessionAnalyzerResponse(result: SessionAnalyzerResult): string {
  return [
    result.summary,
    "",
    "## Extraction",
    "",
    result.extraction,
    "",
    "## Strength",
    "",
    result.strength,
    "",
    "## Balance",
    "",
    result.balance,
    "",
    "## Recommendations",
    "",
    ...result.recommendations.map((r, i) => `${i + 1}. ${r}`),
  ].join("\n");
}
