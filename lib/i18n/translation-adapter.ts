import type { TranslationAdapter, TranslationRequest, TranslationResult } from "@/types/i18n";

/**
 * Future AI Translation: an adapter pattern -- deliberately mirroring
 * `lib/ai/llm-adapter.ts` -- so BrewAtlas can later plug in a real
 * machine-translation provider (reusing the same OpenAI/Anthropic/Gemini
 * completion adapters, or a dedicated translation API) to auto-fill
 * `recipe_translations`, the lookup `*_translations` tables, and
 * `ai_content_translations` for a locale that has no human translation
 * yet -- without changing any calling code.
 *
 * IMPORTANT: no adapter below calls an external API. Every `translate`/
 * `translateBatch` implementation is a clearly-labeled stub that throws
 * `TranslationNotConfiguredError`. Wiring up a real provider later is a
 * matter of filling in one adapter's methods -- `getTranslationAdapter()`
 * and every caller (`lib/data/translations.ts`) stay untouched.
 */

export class TranslationNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      provider === "none"
        ? "No translation provider is configured. Set AI_TRANSLATION_PROVIDER to 'openai' | 'anthropic' | 'gemini' and provide that provider's API key to enable AI-assisted translation."
        : `The '${provider}' translation adapter is wired up structurally but does not call the real API yet -- this is intentional groundwork (see lib/i18n/translation-adapter.ts).`,
    );
    this.name = "TranslationNotConfiguredError";
  }
}

/** Safe default adapter: implements the interface, never calls out, always throws a clear, catchable error. Used when no provider is configured -- every translation in BrewAtlas today is human-authored. */
export class NullTranslationAdapter implements TranslationAdapter {
  readonly provider = "none";

  async translate(_request: TranslationRequest): Promise<TranslationResult> {
    throw new TranslationNotConfiguredError("none");
  }

  async translateBatch(requests: TranslationRequest[]): Promise<TranslationResult[]> {
    if (requests.length === 0) return [];
    throw new TranslationNotConfiguredError("none");
  }
}

/**
 * Structural adapter for OpenAI. Later: install the `openai` package,
 * read `OPENAI_API_KEY`, and implement `translate`/`translateBatch` via
 * `chat.completions.create` with a translation-tuned prompt -- matching
 * this exact interface so `lib/data/translations.ts` needs zero changes.
 */
export class OpenAITranslationAdapter implements TranslationAdapter {
  readonly provider = "openai";
  constructor(readonly apiKey: string | null, readonly model = "gpt-4o-mini") {}

  async translate(_request: TranslationRequest): Promise<TranslationResult> {
    if (!this.apiKey) throw new TranslationNotConfiguredError("openai");
    throw new TranslationNotConfiguredError("openai");
  }

  async translateBatch(_requests: TranslationRequest[]): Promise<TranslationResult[]> {
    if (!this.apiKey) throw new TranslationNotConfiguredError("openai");
    throw new TranslationNotConfiguredError("openai");
  }
}

/** Structural adapter for Anthropic. Later: install `@anthropic-ai/sdk`, read `ANTHROPIC_API_KEY`, and implement both methods via `messages.create`. */
export class AnthropicTranslationAdapter implements TranslationAdapter {
  readonly provider = "anthropic";
  constructor(readonly apiKey: string | null, readonly model = "claude-3-5-haiku-latest") {}

  async translate(_request: TranslationRequest): Promise<TranslationResult> {
    if (!this.apiKey) throw new TranslationNotConfiguredError("anthropic");
    throw new TranslationNotConfiguredError("anthropic");
  }

  async translateBatch(_requests: TranslationRequest[]): Promise<TranslationResult[]> {
    if (!this.apiKey) throw new TranslationNotConfiguredError("anthropic");
    throw new TranslationNotConfiguredError("anthropic");
  }
}

/** Structural adapter for Google Gemini. Later: install `@google/generative-ai`, read `GEMINI_API_KEY`, and implement both methods via `generateContent`. */
export class GeminiTranslationAdapter implements TranslationAdapter {
  readonly provider = "gemini";
  constructor(readonly apiKey: string | null, readonly model = "gemini-1.5-flash") {}

  async translate(_request: TranslationRequest): Promise<TranslationResult> {
    if (!this.apiKey) throw new TranslationNotConfiguredError("gemini");
    throw new TranslationNotConfiguredError("gemini");
  }

  async translateBatch(_requests: TranslationRequest[]): Promise<TranslationResult[]> {
    if (!this.apiKey) throw new TranslationNotConfiguredError("gemini");
    throw new TranslationNotConfiguredError("gemini");
  }
}

const API_KEY_ENV_VARS: Record<"openai" | "anthropic" | "gemini", string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
};

/**
 * Returns the configured `TranslationAdapter` for the app, chosen via
 * the `AI_TRANSLATION_PROVIDER` environment variable, defaulting to
 * `NullTranslationAdapter` when unset -- so BrewAtlas i18n works today
 * with zero AI configuration (every current translation is
 * human-authored), and switching providers later is purely an
 * environment/config change.
 */
export function getTranslationAdapter(): TranslationAdapter {
  const provider = (process.env.AI_TRANSLATION_PROVIDER ?? "none").toLowerCase();

  switch (provider) {
    case "openai":
      return new OpenAITranslationAdapter(process.env[API_KEY_ENV_VARS.openai] ?? null);
    case "anthropic":
      return new AnthropicTranslationAdapter(process.env[API_KEY_ENV_VARS.anthropic] ?? null);
    case "gemini":
      return new GeminiTranslationAdapter(process.env[API_KEY_ENV_VARS.gemini] ?? null);
    default:
      return new NullTranslationAdapter();
  }
}

/** Convenience no-op check used by callers that want to skip AI translation calls entirely while none is configured, e.g. `lib/data/translations.ts#backfillMissingTranslation`. */
export function isTranslationAdapterConfigured(): boolean {
  return (process.env.AI_TRANSLATION_PROVIDER ?? "none").toLowerCase() !== "none";
}
