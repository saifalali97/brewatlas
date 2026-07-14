import type { ConfidenceLevel } from "@/lib/converter";
import type { LLMProvider } from "@/types/ai";

/**
 * Types for the AI Coach Foundation (Phase 19): three guided tools built
 * on top of the existing engines (`lib/ai/coach-engine.ts` for diagnosis,
 * `lib/converter` for device baselines) rather than a fourth parallel
 * scoring model.
 *
 * Nothing here calls an external API yet. `lib/ai/coach-tools-engine.ts`
 * produces every result deterministically from the input alone; the
 * adapter in `lib/ai/coach-tools-adapter.ts` (mirroring
 * `lib/ai/coach-adapter.ts` and `lib/ai/llm-adapter.ts` exactly) is the
 * seam where a real OpenAI/Anthropic/Gemini model can later replace the
 * mock without any calling code -- forms, response cards, prompt
 * builders -- changing.
 */

export const COACH_TOOL_IDS = ["diagnose", "generate", "improve"] as const;
export type CoachToolId = (typeof COACH_TOOL_IDS)[number];

export const ROAST_LEVEL_CODES = ["light", "medium", "mediumDark", "dark"] as const;
export type RoastLevelCode = (typeof ROAST_LEVEL_CODES)[number];

export const PROCESS_CODES = ["washed", "natural", "honey", "anaerobic"] as const;
export type ProcessCode = (typeof PROCESS_CODES)[number];

/** Every field a coach tool form could show. Each tool only renders the subset relevant to it -- see `CoachToolFieldConfig`. */
export type CoachToolFieldKey =
  | "device"
  | "brewMethod"
  | "origin"
  | "roastLevel"
  | "process"
  | "doseG"
  | "waterG"
  | "temperatureC"
  | "grindSize"
  | "brewTime"
  | "notes";

/** Raw, string-based controlled-input state for a coach tool form -- parsed into `CoachToolInput` at submit time. */
export type CoachToolFormValues = {
  device: string;
  brewMethod: string;
  origin: string;
  roastLevel: RoastLevelCode | "";
  process: ProcessCode | "";
  doseG: string;
  waterG: string;
  temperatureC: string;
  grindSize: string;
  brewTime: string;
  notes: string;
};

/** Parsed form values, ready for `lib/ai/coach-tools-engine.ts` and `lib/ai/coach-prompts.ts`. */
export type CoachToolInput = {
  device: string | null;
  brewMethod: string | null;
  origin: string | null;
  roastLevel: RoastLevelCode | null;
  process: ProcessCode | null;
  doseG: number | null;
  waterG: number | null;
  temperatureC: number | null;
  grindSize: string | null;
  brewTime: string | null;
  notes: string | null;
};

/**
 * Closed set of predicted tasting notes/outcomes. Kept as codes (not
 * free text) so the mock -- and later a real model -- can stay fully
 * translatable through `lib/i18n` in every locale.
 */
export const FLAVOR_NOTE_CODES = [
  "floral",
  "citrus",
  "berry",
  "stoneFruit",
  "tropicalFruit",
  "winey",
  "chocolate",
  "nutty",
  "caramel",
  "spice",
  "herbal",
  "clean",
  "bright",
  "heavy",
  "syrupy",
  "balanced",
  "sour",
  "bitter",
  "flat",
  "muddy",
] as const;
export type FlavorNoteCode = (typeof FLAVOR_NOTE_CODES)[number];

/**
 * Closed set of reasons behind a suggested recipe / diagnosis, each
 * optionally parameterized (e.g. `{ device: "V60" }`) for interpolation
 * into the translated sentence. Mirrors the `ChangeReasonCode` pattern
 * from the Universal Recipe Converter (Phase 18).
 */
export type ExplanationPointCode =
  | "deviceBaseline"
  | "roastLevelLight"
  | "roastLevelMedium"
  | "roastLevelMediumDark"
  | "roastLevelDark"
  | "processWashed"
  | "processNatural"
  | "processHoney"
  | "processAnaerobic"
  | "notesPreference"
  | "correctedGrind"
  | "correctedTemperature"
  | "correctedBrewTime"
  | "correctedRatio"
  | "correctedBloom"
  | "withinIdealRange"
  | "missingData";

export type ExplanationPoint = {
  code: ExplanationPointCode;
  params?: Record<string, string>;
};

/** The recipe a coach tool recommends -- deliberately the same shape for all three tools so one response card renders all of them. */
export type SuggestedRecipe = {
  device: string | null;
  brewMethod: string | null;
  doseG: number | null;
  waterG: number | null;
  ratioDisplay: string | null;
  grindSize: string | null;
  temperatureC: number | null;
  brewTimeDisplay: string | null;
};

/** The uniform "AI response" shape every coach tool returns (Phase 19 requirement: suggested recipe, explanation, confidence, flavor prediction). */
export type CoachToolResult = {
  tool: CoachToolId;
  suggestedRecipe: SuggestedRecipe;
  explanation: ExplanationPoint[];
  confidence: ConfidenceLevel;
  flavorPrediction: FlavorNoteCode[];
};

// ---------------------------------------------------------------------------
// Future LLM Support (adapter pattern). Mirrors `lib/ai/coach-adapter.ts`
// and `lib/ai/llm-adapter.ts` exactly. No implementation in
// `lib/ai/coach-tools-adapter.ts` calls an external API yet.
// ---------------------------------------------------------------------------

export type CoachToolRequest = {
  tool: CoachToolId;
  input: CoachToolInput;
  /** The same text a real LLM call would eventually receive -- see `lib/ai/coach-prompts.ts`. Unused by the mock adapter, carried through for parity/logging. */
  prompt: string;
};

/**
 * The adapter every coach tool provider implements. UI code (the coach
 * tool orchestrator component) is written against this interface, not
 * against any specific provider -- swapping `getCoachToolsAdapter()`'s
 * configured provider later is an environment/config change, not a
 * calling-code change. The default (`MockCoachToolsAdapter`, see
 * `lib/ai/coach-tools-adapter.ts`) never calls out; it runs the pure,
 * deterministic functions in `lib/ai/coach-tools-engine.ts`.
 */
export interface CoachToolsAdapter {
  readonly provider: LLMProvider;
  run(request: CoachToolRequest): Promise<CoachToolResult>;
}
