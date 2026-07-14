import type { CoachToolId, CoachToolInput } from "@/types/coach-tools";

/**
 * Reusable prompt builders for the AI Coach Foundation (Phase 19). Pure
 * string composition, no I/O -- these are exactly what
 * `lib/ai/coach-tools-adapter.ts` would hand to a real OpenAI/Anthropic/
 * Gemini model once one is wired up. Until then, `MockCoachToolsAdapter`
 * builds the prompt (so the seam is exercised end-to-end) but answers
 * with the deterministic engine in `lib/ai/coach-tools-engine.ts`
 * instead of sending it anywhere.
 *
 * Written in English regardless of UI locale -- same convention as the
 * rest of BrewAtlas's AI layer (see `lib/ai/coach-messages.ts`), since
 * prompts are model-facing, not user-facing text.
 */

function describeInput(input: CoachToolInput): string {
  const lines: string[] = [];
  if (input.device) lines.push(`Device: ${input.device}`);
  if (input.brewMethod) lines.push(`Brew method: ${input.brewMethod}`);
  if (input.origin) lines.push(`Coffee origin: ${input.origin}`);
  if (input.roastLevel) lines.push(`Roast level: ${input.roastLevel}`);
  if (input.process) lines.push(`Process: ${input.process}`);
  if (input.doseG !== null) lines.push(`Dose: ${input.doseG}g`);
  if (input.waterG !== null) lines.push(`Water: ${input.waterG}g`);
  if (input.temperatureC !== null) lines.push(`Water temperature: ${input.temperatureC}°C`);
  if (input.grindSize) lines.push(`Grind size: ${input.grindSize}`);
  if (input.brewTime) lines.push(`Total brew time: ${input.brewTime}`);
  if (input.notes) lines.push(`User notes: "${input.notes}"`);
  return lines.length > 0 ? lines.join("\n") : "(no fields provided)";
}

const RESPONSE_CONTRACT = [
  "Respond with a suggested recipe (device, brew method, dose in grams, water in grams, ratio, grind size, water temperature in Celsius, total brew time),",
  "a short list of reasons for your changes, a confidence level (high, medium, or low), and a predicted flavor profile (a short list of tasting notes).",
].join(" ");

export function buildDiagnosePrompt(input: CoachToolInput): string {
  return [
    "You are a specialty coffee brewing coach. A user brewed a recipe and wants to know what, if anything, is wrong with it and how to fix it.",
    "",
    describeInput(input),
    "",
    "Diagnose this brew against known-good extraction ranges for the stated device/method. Identify any parameters that are likely causing off flavors.",
    RESPONSE_CONTRACT,
  ].join("\n");
}

export function buildGeneratePrompt(input: CoachToolInput): string {
  return [
    "You are a specialty coffee brewing coach. A user wants a brand-new recipe for a device/method, with no existing recipe to start from.",
    "",
    describeInput(input),
    "",
    "Generate a complete, realistic starting recipe for this device, informed by the stated roast level, process, and any notes about the desired cup.",
    RESPONSE_CONTRACT,
  ].join("\n");
}

export function buildImprovePrompt(input: CoachToolInput): string {
  return [
    "You are a specialty coffee brewing coach. A user has a working recipe they want refined further, possibly toward a specific taste preference.",
    "",
    describeInput(input),
    "",
    "Suggest a refined version of this recipe. Weigh the user's notes as an explicit taste preference in addition to correcting any technical issues.",
    RESPONSE_CONTRACT,
  ].join("\n");
}

/** Dispatches to the right prompt builder for a given tool -- the single entry point `lib/ai/coach-tools-adapter.ts` uses. */
export function buildCoachToolPrompt(tool: CoachToolId, input: CoachToolInput): string {
  if (tool === "diagnose") return buildDiagnosePrompt(input);
  if (tool === "generate") return buildGeneratePrompt(input);
  return buildImprovePrompt(input);
}
