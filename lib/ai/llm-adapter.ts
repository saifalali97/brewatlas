import type { LLMAdapter, LLMCompletionRequest, LLMCompletionResponse, LLMEmbeddingRequest, LLMEmbeddingResponse, LLMProvider } from "@/types/ai";

/**
 * Future LLM Support: an adapter pattern so BrewAtlas AI can later plug
 * in a real OpenAI / Anthropic / Gemini model -- for richer Smart Recipe
 * Discovery query parsing, generated recommendation explanations, or
 * real text embeddings -- without changing any calling code.
 *
 * IMPORTANT: none of the adapters below call an external API. Every
 * `complete`/`embed` implementation is a clearly-labeled stub that
 * throws `LLMNotConfiguredError`. Wiring up a real provider later is a
 * matter of filling in one adapter's two methods (installing that
 * provider's SDK, reading its API key from the environment, and making
 * the request) -- `getLLMAdapter()` and every caller stay untouched.
 */

export class LLMNotConfiguredError extends Error {
  constructor(provider: LLMProvider) {
    super(
      provider === "none"
        ? "No LLM provider is configured. Set AI_LLM_PROVIDER to 'openai' | 'anthropic' | 'gemini' and provide that provider's API key to enable LLM-backed features."
        : `The '${provider}' adapter is wired up structurally but does not call the real API yet -- this is intentional groundwork (see lib/ai/llm-adapter.ts).`,
    );
    this.name = "LLMNotConfiguredError";
  }
}

/** Safe default adapter: implements the interface, never calls out, always throws a clear, catchable error. Used when no provider is configured. */
export class NullLLMAdapter implements LLMAdapter {
  readonly provider: LLMProvider = "none";

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    void request;
    throw new LLMNotConfiguredError("none");
  }

  async embed(request: LLMEmbeddingRequest): Promise<LLMEmbeddingResponse> {
    void request;
    throw new LLMNotConfiguredError("none");
  }
}

/**
 * Structural adapter for OpenAI. Later: install the `openai` package,
 * read `OPENAI_API_KEY`, and implement `complete` via
 * `chat.completions.create` and `embed` via `embeddings.create` (e.g.
 * `text-embedding-3-small`) -- matching this exact interface so
 * `lib/ai/discovery-engine.ts` / `lib/data/ai.ts` need zero changes.
 */
export class OpenAIAdapter implements LLMAdapter {
  readonly provider: LLMProvider = "openai";
  constructor(private readonly apiKey: string | null, readonly model = "gpt-4o-mini") {}

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    void request;
    if (!this.apiKey) throw new LLMNotConfiguredError("openai");
    throw new LLMNotConfiguredError("openai");
  }

  async embed(request: LLMEmbeddingRequest): Promise<LLMEmbeddingResponse> {
    void request;
    if (!this.apiKey) throw new LLMNotConfiguredError("openai");
    throw new LLMNotConfiguredError("openai");
  }
}

/**
 * Structural adapter for Anthropic. Later: install `@anthropic-ai/sdk`,
 * read `ANTHROPIC_API_KEY`, and implement `complete` via
 * `messages.create`. Anthropic has no first-party embeddings API, so a
 * real `embed()` would need to delegate to another provider -- left as a
 * clearly-marked TODO rather than guessed at here.
 */
export class AnthropicAdapter implements LLMAdapter {
  readonly provider: LLMProvider = "anthropic";
  constructor(private readonly apiKey: string | null, readonly model = "claude-3-5-haiku-latest") {}

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    void request;
    if (!this.apiKey) throw new LLMNotConfiguredError("anthropic");
    throw new LLMNotConfiguredError("anthropic");
  }

  async embed(request: LLMEmbeddingRequest): Promise<LLMEmbeddingResponse> {
    void request;
    // TODO: Anthropic has no embeddings endpoint; route to OpenAI/Gemini or a dedicated embeddings provider once this is wired up.
    throw new LLMNotConfiguredError("anthropic");
  }
}

/**
 * Structural adapter for Google Gemini. Later: install
 * `@google/generative-ai`, read `GEMINI_API_KEY`, and implement
 * `complete` via `generateContent` and `embed` via `embedContent`
 * (`text-embedding-004`).
 */
export class GeminiAdapter implements LLMAdapter {
  readonly provider: LLMProvider = "gemini";
  constructor(private readonly apiKey: string | null, readonly model = "gemini-1.5-flash") {}

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    void request;
    if (!this.apiKey) throw new LLMNotConfiguredError("gemini");
    throw new LLMNotConfiguredError("gemini");
  }

  async embed(request: LLMEmbeddingRequest): Promise<LLMEmbeddingResponse> {
    void request;
    if (!this.apiKey) throw new LLMNotConfiguredError("gemini");
    throw new LLMNotConfiguredError("gemini");
  }
}

const API_KEY_ENV_VARS: Record<Exclude<LLMProvider, "none">, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
};

/**
 * Returns the configured `LLMAdapter` for the app, chosen via the
 * `AI_LLM_PROVIDER` environment variable ("openai" | "anthropic" |
 * "gemini"), defaulting to `NullLLMAdapter` when unset -- so the rest of
 * BrewAtlas AI works today with zero LLM configuration, and switching
 * providers later is purely an environment/config change.
 */
export function getLLMAdapter(): LLMAdapter {
  const provider = (process.env.AI_LLM_PROVIDER ?? "none").toLowerCase() as LLMProvider;

  switch (provider) {
    case "openai":
      return new OpenAIAdapter(process.env[API_KEY_ENV_VARS.openai] ?? null);
    case "anthropic":
      return new AnthropicAdapter(process.env[API_KEY_ENV_VARS.anthropic] ?? null);
    case "gemini":
      return new GeminiAdapter(process.env[API_KEY_ENV_VARS.gemini] ?? null);
    default:
      return new NullLLMAdapter();
  }
}
