import { runCoachTool } from "@/lib/ai/coach-tools-engine";
import type { GuidedBrewInput, GuidedBrewResult, RecipeGeneratorInput, GeneratedRecipe } from "@/types/ai-coach-module";
import type { CoachToolInput } from "@/types/coach-tools";

function mapRoastLevel(roast?: string | null): CoachToolInput["roastLevel"] {
  if (!roast) return null;
  const lower = roast.toLowerCase();
  if (lower.includes("light")) return "light";
  if (lower.includes("dark")) return "dark";
  if (lower.includes("medium-dark") || lower.includes("medium dark")) return "mediumDark";
  return "medium";
}

function mapProcess(processing?: string | null): CoachToolInput["process"] {
  if (!processing) return null;
  const lower = processing.toLowerCase();
  if (lower.includes("natural")) return "natural";
  if (lower.includes("honey")) return "honey";
  if (lower.includes("anaerobic")) return "anaerobic";
  return "washed";
}

/** Interactive guided brewing flow — generates personalized recommendations. */
export function runGuidedBrew(input: GuidedBrewInput): GuidedBrewResult {
  const toolInput: CoachToolInput = {
    device: input.method,
    brewMethod: input.method,
    origin: input.origin ?? null,
    roastLevel: mapRoastLevel(input.roastLevel),
    process: mapProcess(input.processing),
    doseG: input.doseG ?? null,
    waterG: input.waterG ?? null,
    temperatureC: input.temperatureC ?? null,
    grindSize: input.grinderClicks ?? null,
    brewTime: null,
    notes: [input.desiredFlavor, input.currentIssue].filter(Boolean).join(". ") || null,
  };

  const generated = runCoachTool("generate", toolInput);
  const recipe = generated.suggestedRecipe;

  const parameters: Record<string, string> = {};
  if (recipe.doseG) parameters["Dose"] = `${recipe.doseG}g`;
  if (recipe.waterG) parameters["Water"] = `${recipe.waterG}g`;
  if (recipe.ratioDisplay) parameters["Ratio"] = recipe.ratioDisplay;
  if (recipe.grindSize) parameters["Grind"] = recipe.grindSize;
  if (recipe.temperatureC) parameters["Temperature"] = `${recipe.temperatureC}°C`;
  if (recipe.brewTimeDisplay) parameters["Brew time"] = recipe.brewTimeDisplay;
  if (input.grinder) parameters["Grinder"] = input.grinder;
  if (input.filter) parameters["Filter"] = input.filter;

  const recommendations = generated.explanation.map((p) => p.code.replace(/([A-Z])/g, " $1").trim());

  return {
    summary: `Personalized ${input.method} recommendations based on your inputs.`,
    recommendations,
    parameters,
    whyItWorks: generated.explanation.map((p) => `- ${p.code}`).join("\n"),
  };
}

/** Personalized recipe generator built on the existing coach tools engine. */
export function generatePersonalizedRecipe(input: RecipeGeneratorInput): GeneratedRecipe {
  const toolInput: CoachToolInput = {
    device: input.method,
    brewMethod: input.method,
    origin: input.coffee ?? null,
    roastLevel: mapRoastLevel(input.roast),
    process: mapProcess(input.processing),
    doseG: null,
    waterG: null,
    temperatureC: null,
    grindSize: null,
    brewTime: null,
    notes: input.flavorPreference ?? null,
  };

  const result = runCoachTool("generate", toolInput);
  const recipe = result.suggestedRecipe;

  const doseG = recipe.doseG ?? 15;
  const waterG = recipe.waterG ?? 250;

  return {
    title: `${input.method} Recipe`,
    method: input.method,
    doseG,
    waterG,
    ratio: recipe.ratioDisplay ?? `1:${(waterG / doseG).toFixed(1)}`,
    grindSize: recipe.grindSize ?? "Medium-fine",
    temperatureC: recipe.temperatureC ?? 93,
    brewTime: recipe.brewTimeDisplay ?? "3:00",
    steps: [
      "Rinse filter and preheat vessel",
      "Bloom 30s with 2× dose weight of water",
      "Pour in controlled spirals to target weight",
      "Allow steady drawdown and serve",
    ],
    whyItWorks: result.explanation.map((p) => p.code).join(", ") || "Balanced parameters for your method and coffee.",
    expectedFlavor: result.flavorPrediction.join(", ") || "Balanced, sweet",
    adjustments: [
      "If sour: grind finer or raise temperature 1°C",
      "If bitter: grind coarser or lower temperature 1°C",
      "If weak: increase dose or tighten ratio",
    ],
  };
}

export function formatGuidedBrewResponse(result: GuidedBrewResult): string {
  const paramLines = Object.entries(result.parameters).map(([k, v]) => `- **${k}:** ${v}`);
  return [
    result.summary,
    "",
    "## Recommended Parameters",
    "",
    ...paramLines,
    "",
    "## Why This Works",
    "",
    result.whyItWorks,
    "",
    "## Tips",
    "",
    ...result.recommendations.map((r, i) => `${i + 1}. ${r}`),
  ].join("\n");
}

export function formatRecipeResponse(recipe: GeneratedRecipe): string {
  return [
    `# ${recipe.title}`,
    "",
    `**Method:** ${recipe.method} · **Ratio:** ${recipe.ratio} · **Grind:** ${recipe.grindSize}`,
    "",
    "| Parameter | Value |",
    "| --- | --- |",
    `| Dose | ${recipe.doseG}g |`,
    `| Water | ${recipe.waterG}g |`,
    `| Temperature | ${recipe.temperatureC}°C |`,
    `| Brew time | ${recipe.brewTime} |`,
    "",
    "## Steps",
    "",
    ...recipe.steps.map((s, i) => `${i + 1}. ${s}`),
    "",
    "## Why It Works",
    "",
    recipe.whyItWorks,
    "",
    "**Expected flavor:** " + recipe.expectedFlavor,
    "",
    "## Adjustments",
    "",
    ...recipe.adjustments.map((a) => `- ${a}`),
  ].join("\n");
}
