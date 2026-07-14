import type { CoachAdapter, CoachNarrativeRequest, CoachNarrativeResponse } from "@/types/coach";
import type { LLMProvider } from "@/types/ai";

/**
 * Future LLM Support for the AI Coach (requirements 12/13): an adapter
 * pattern so a real OpenAI / Anthropic / Gemini model can later rewrite
 * the deterministic analysis from `lib/ai/coach-engine.ts` into a more
 * conversational narrative, without changing `lib/data/ai-coach.ts` or
 * any other calling code. Mirrors `lib/ai/llm-adapter.ts` exactly.
 *
 * IMPORTANT: none of the adapters below call an external API
 * (requirement 14). `RuleBasedCoachAdapter` is the real, working
 * default -- it just joins the engine's own `messages` into prose. The
 * three provider adapters are clearly-labeled structural stubs that
 * throw `CoachAdapterNotConfiguredError`.
 */

export class CoachAdapterNotConfiguredError extends Error {
  constructor(provider: LLMProvider) {
    super(
      provider === "none"
        ? "No LLM provider is configured for the AI Coach narrative -- this is expected; RuleBasedCoachAdapter handles it deterministically instead."
        : `The '${provider}' Coach adapter is wired up structurally but does not call the real API yet -- this is intentional groundwork (see lib/ai/coach-adapter.ts).`,
    );
    this.name = "CoachAdapterNotConfiguredError";
  }
}

/**
 * The real default adapter: never calls out, always available. Turns
 * the deterministic `CoachAnalysisResult.messages` into a short prose
 * narrative purely by string composition -- no model, no randomness.
 */
export class RuleBasedCoachAdapter implements CoachAdapter {
  readonly provider: LLMProvider = "none";

  async explainAnalysis({ analysis, recipeTitle }: CoachNarrativeRequest): Promise<CoachNarrativeResponse> {
    const lead = `${recipeTitle} scores ${analysis.brewScore}/100 (${analysis.confidence.level} confidence).`;
    const body = analysis.messages.map((message) => message.message).join(" ");
    return { narrative: body ? `${lead} ${body}` : lead, provider: this.provider };
  }
}

/**
 * Structural adapter for OpenAI. Later: install the `openai` package,
 * read `OPENAI_API_KEY`, and implement `explainAnalysis` via
 * `chat.completions.create`, prompting it with the same
 * `CoachAnalysisResult` this file already produces deterministically --
 * `lib/data/ai-coach.ts` needs zero changes either way.
 */
export class OpenAICoachAdapter implements CoachAdapter {
  readonly provider: LLMProvider = "openai";
  constructor(private readonly apiKey: string | null, readonly model = "gpt-4o-mini") {}

  async explainAnalysis(request: CoachNarrativeRequest): Promise<CoachNarrativeResponse> {
    void request;
    if (!this.apiKey) throw new CoachAdapterNotConfiguredError("openai");
    throw new CoachAdapterNotConfiguredError("openai");
  }
}

/** Structural adapter for Anthropic. Later: install `@anthropic-ai/sdk`, read `ANTHROPIC_API_KEY`, implement via `messages.create`. */
export class AnthropicCoachAdapter implements CoachAdapter {
  readonly provider: LLMProvider = "anthropic";
  constructor(private readonly apiKey: string | null, readonly model = "claude-3-5-haiku-latest") {}

  async explainAnalysis(request: CoachNarrativeRequest): Promise<CoachNarrativeResponse> {
    void request;
    if (!this.apiKey) throw new CoachAdapterNotConfiguredError("anthropic");
    throw new CoachAdapterNotConfiguredError("anthropic");
  }
}

/** Structural adapter for Google Gemini. Later: install `@google/generative-ai`, read `GEMINI_API_KEY`, implement via `generateContent`. */
export class GeminiCoachAdapter implements CoachAdapter {
  readonly provider: LLMProvider = "gemini";
  constructor(private readonly apiKey: string | null, readonly model = "gemini-1.5-flash") {}

  async explainAnalysis(request: CoachNarrativeRequest): Promise<CoachNarrativeResponse> {
    void request;
    if (!this.apiKey) throw new CoachAdapterNotConfiguredError("gemini");
    throw new CoachAdapterNotConfiguredError("gemini");
  }
}

const API_KEY_ENV_VARS: Record<Exclude<LLMProvider, "none">, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
};

/**
 * Returns the configured `CoachAdapter`, chosen via the
 * `AI_COACH_PROVIDER` environment variable ("openai" | "anthropic" |
 * "gemini"), defaulting to `RuleBasedCoachAdapter` when unset -- so
 * AI Coach narratives work today with zero LLM configuration, and
 * switching providers later is purely an environment/config change.
 */
export function getCoachAdapter(): CoachAdapter {
  const provider = (process.env.AI_COACH_PROVIDER ?? "none").toLowerCase() as LLMProvider;

  switch (provider) {
    case "openai":
      return new OpenAICoachAdapter(process.env[API_KEY_ENV_VARS.openai] ?? null);
    case "anthropic":
      return new AnthropicCoachAdapter(process.env[API_KEY_ENV_VARS.anthropic] ?? null);
    case "gemini":
      return new GeminiCoachAdapter(process.env[API_KEY_ENV_VARS.gemini] ?? null);
    default:
      return new RuleBasedCoachAdapter();
  }
}
