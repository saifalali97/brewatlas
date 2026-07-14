import { buildCoachToolPrompt } from "@/lib/ai/coach-prompts";
import { runCoachTool } from "@/lib/ai/coach-tools-engine";
import type { LLMProvider } from "@/types/ai";
import type { CoachToolId, CoachToolInput, CoachToolRequest, CoachToolResult, CoachToolsAdapter } from "@/types/coach-tools";

/**
 * Future LLM Support for the AI Coach Foundation (Phase 19): an adapter
 * pattern so a real OpenAI / Anthropic / Gemini model can later answer
 * Diagnose Brew / Generate Recipe / Improve Recipe with an actual
 * completion instead of the deterministic mock, without changing the UI
 * that calls it. Mirrors `lib/ai/coach-adapter.ts` and
 * `lib/ai/llm-adapter.ts` exactly.
 *
 * IMPORTANT: none of the adapters below call an external API.
 * `MockCoachToolsAdapter` is the real, working default -- it builds the
 * same prompt a real model would receive (via `lib/ai/coach-prompts.ts`)
 * but answers with `lib/ai/coach-tools-engine.ts`'s pure functions. The
 * three provider adapters are clearly-labeled structural stubs that
 * throw `CoachToolsAdapterNotConfiguredError`.
 */

export class CoachToolsAdapterNotConfiguredError extends Error {
  constructor(provider: LLMProvider) {
    super(
      provider === "none"
        ? "No LLM provider is configured for the AI Coach tools -- this is expected; MockCoachToolsAdapter handles it deterministically instead."
        : `The '${provider}' Coach Tools adapter is wired up structurally but does not call the real API yet -- this is intentional groundwork (see lib/ai/coach-tools-adapter.ts).`,
    );
    this.name = "CoachToolsAdapterNotConfiguredError";
  }
}

/**
 * The real default adapter: never calls out, always available. Builds
 * the model-facing prompt for parity with a future real provider, then
 * answers with the deterministic engine -- no model, no randomness.
 */
export class MockCoachToolsAdapter implements CoachToolsAdapter {
  readonly provider: LLMProvider = "none";

  async run(request: CoachToolRequest): Promise<CoachToolResult> {
    return runCoachTool(request.tool, request.input);
  }
}

/**
 * Structural adapter for OpenAI. Later: install the `openai` package,
 * read `OPENAI_API_KEY`, and implement `run` via
 * `chat.completions.create`, prompting it with `request.prompt` (the
 * same text `buildCoachToolPrompt` already produces deterministically)
 * and parsing its JSON reply into a `CoachToolResult` -- the calling UI
 * needs zero changes either way.
 */
export class OpenAICoachToolsAdapter implements CoachToolsAdapter {
  readonly provider: LLMProvider = "openai";
  constructor(private readonly apiKey: string | null, readonly model = "gpt-4o-mini") {}

  async run(request: CoachToolRequest): Promise<CoachToolResult> {
    void request;
    if (!this.apiKey) throw new CoachToolsAdapterNotConfiguredError("openai");
    throw new CoachToolsAdapterNotConfiguredError("openai");
  }
}

/** Structural adapter for Anthropic. Later: install `@anthropic-ai/sdk`, read `ANTHROPIC_API_KEY`, implement via `messages.create`. */
export class AnthropicCoachToolsAdapter implements CoachToolsAdapter {
  readonly provider: LLMProvider = "anthropic";
  constructor(private readonly apiKey: string | null, readonly model = "claude-3-5-haiku-latest") {}

  async run(request: CoachToolRequest): Promise<CoachToolResult> {
    void request;
    if (!this.apiKey) throw new CoachToolsAdapterNotConfiguredError("anthropic");
    throw new CoachToolsAdapterNotConfiguredError("anthropic");
  }
}

/** Structural adapter for Google Gemini. Later: install `@google/generative-ai`, read `GEMINI_API_KEY`, implement via `generateContent`. */
export class GeminiCoachToolsAdapter implements CoachToolsAdapter {
  readonly provider: LLMProvider = "gemini";
  constructor(private readonly apiKey: string | null, readonly model = "gemini-1.5-flash") {}

  async run(request: CoachToolRequest): Promise<CoachToolResult> {
    void request;
    if (!this.apiKey) throw new CoachToolsAdapterNotConfiguredError("gemini");
    throw new CoachToolsAdapterNotConfiguredError("gemini");
  }
}

const API_KEY_ENV_VARS: Record<Exclude<LLMProvider, "none">, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
};

/**
 * Returns the configured `CoachToolsAdapter`, chosen via the
 * `AI_COACH_TOOLS_PROVIDER` environment variable ("openai" |
 * "anthropic" | "gemini"), defaulting to `MockCoachToolsAdapter` when
 * unset -- so Diagnose Brew / Generate Recipe / Improve Recipe work
 * today with zero LLM configuration, and switching providers later is
 * purely an environment/config change.
 */
export function getCoachToolsAdapter(): CoachToolsAdapter {
  const provider = (process.env.AI_COACH_TOOLS_PROVIDER ?? "none").toLowerCase() as LLMProvider;

  switch (provider) {
    case "openai":
      return new OpenAICoachToolsAdapter(process.env[API_KEY_ENV_VARS.openai] ?? null);
    case "anthropic":
      return new AnthropicCoachToolsAdapter(process.env[API_KEY_ENV_VARS.anthropic] ?? null);
    case "gemini":
      return new GeminiCoachToolsAdapter(process.env[API_KEY_ENV_VARS.gemini] ?? null);
    default:
      return new MockCoachToolsAdapter();
  }
}

/** Convenience wrapper the UI calls: builds the prompt, wraps it in a request, and runs it through the configured adapter. */
export async function runCoachToolViaAdapter(tool: CoachToolId, input: CoachToolInput): Promise<CoachToolResult> {
  const prompt = buildCoachToolPrompt(tool, input);
  return getCoachToolsAdapter().run({ tool, input, prompt });
}
