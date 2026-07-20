import { answerKnowledgeQuestion, generateChatResponse } from "@/lib/ai/coach-knowledge-engine";
import { diagnoseBrew, formatBrewDoctorResponse } from "@/lib/ai/brew-doctor-engine";
import { buildCoachSystemPrompt, buildOpenAiInputMessages } from "@/lib/ai/coach-module-prompts";
import { CoachModuleNotConfiguredError } from "@/lib/ai/coach-module-errors";
import { formatGuidedBrewResponse, formatRecipeResponse, generatePersonalizedRecipe, runGuidedBrew } from "@/lib/ai/guided-brew-engine";
import { OpenAiResponsesClient } from "@/lib/ai/openai-responses-client";
import { analyzeBrewSession, formatSessionAnalyzerResponse } from "@/lib/ai/session-analyzer-engine";
import type {
  AiCoachChatRequest,
  AiCoachChatResponse,
  AiCoachChatStreamChunk,
  AiCoachMessage,
  AiCoachModuleAdapter,
  AiCoachPreferences,
  BrewDoctorInput,
  BrewDoctorResult,
  GeneratedRecipe,
  GuidedBrewInput,
  GuidedBrewResult,
  SessionAnalyzerInput,
  SessionAnalyzerResult,
} from "@/types/ai-coach-module";

/**
 * Deterministic AI Coach adapter — pure rule-based responses with no
 * external API calls. Mirrors lib/ai/llm-adapter.ts and
 * lib/ai/coach-tools-adapter.ts adapter pattern.
 */

export class RuleBasedCoachModuleAdapter implements AiCoachModuleAdapter {
  readonly provider = "rule-based";

  constructor(private readonly preferences: AiCoachPreferences | null = null) {}

  async chat(request: AiCoachChatRequest & { history: AiCoachMessage[] }): Promise<AiCoachChatResponse> {
    const content = generateChatResponse(request.message, request.history, this.preferences);
    return {
      content,
      conversationId: request.conversationId ?? "",
      messageId: "",
    };
  }

  async brewDoctor(input: BrewDoctorInput): Promise<BrewDoctorResult> {
    return diagnoseBrew(input);
  }

  async guidedBrew(input: GuidedBrewInput): Promise<GuidedBrewResult> {
    return runGuidedBrew(input);
  }

  async generateRecipe(input: Parameters<AiCoachModuleAdapter["generateRecipe"]>[0]): Promise<GeneratedRecipe> {
    return generatePersonalizedRecipe(input);
  }

  async analyzeSession(input: SessionAnalyzerInput): Promise<SessionAnalyzerResult> {
    return analyzeBrewSession(input);
  }

  async answerKnowledge(question: string): Promise<string> {
    return answerKnowledgeQuestion(question);
  }
}

export { CoachModuleNotConfiguredError } from "@/lib/ai/coach-module-errors";

export class OpenAICoachModuleAdapter implements AiCoachModuleAdapter {
  readonly provider = "openai";
  readonly supportsStreaming = true;

  private readonly ruleBasedFallback: RuleBasedCoachModuleAdapter;
  private readonly client: OpenAiResponsesClient | null;

  constructor(
    private readonly apiKey: string | null,
    private readonly preferences: AiCoachPreferences | null = null,
  ) {
    this.ruleBasedFallback = new RuleBasedCoachModuleAdapter(preferences);
    this.client = apiKey ? new OpenAiResponsesClient({ apiKey }) : null;
  }

  private assertConfigured(): OpenAiResponsesClient {
    if (!this.apiKey || !this.client) {
      throw new CoachModuleNotConfiguredError("openai");
    }
    return this.client;
  }

  async chat(request: AiCoachChatRequest & { history: AiCoachMessage[] }): Promise<AiCoachChatResponse> {
    const client = this.assertConfigured();
    const officialContext =
      typeof request.context?.officialRecipes === "string" ? request.context.officialRecipes : undefined;
    const brewingContext =
      typeof request.context?.brewingSetup === "string" ? request.context.brewingSetup : undefined;
    const content = await client.createResponse({
      model: client.model,
      instructions: buildCoachSystemPrompt(this.preferences, request.mode ?? "chat", officialContext, brewingContext),
      input: buildOpenAiInputMessages(request.history, request.message),
    });

    return {
      content,
      conversationId: request.conversationId ?? "",
      messageId: "",
    };
  }

  async *chatStream(
    request: AiCoachChatRequest & { history: AiCoachMessage[] },
  ): AsyncIterable<AiCoachChatStreamChunk> {
    const client = this.assertConfigured();
    let fullText = "";

    for await (const delta of client.streamResponse({
      model: client.model,
      instructions: buildCoachSystemPrompt(
        this.preferences,
        request.mode ?? "chat",
        typeof request.context?.officialRecipes === "string" ? request.context.officialRecipes : undefined,
        typeof request.context?.brewingSetup === "string" ? request.context.brewingSetup : undefined,
      ),
      input: buildOpenAiInputMessages(request.history, request.message),
    })) {
      fullText += delta;
      yield { type: "delta", content: delta };
    }

    yield { type: "done", content: fullText };
  }

  async brewDoctor(input: BrewDoctorInput): Promise<BrewDoctorResult> {
    return this.ruleBasedFallback.brewDoctor(input);
  }

  async guidedBrew(input: GuidedBrewInput): Promise<GuidedBrewResult> {
    return this.ruleBasedFallback.guidedBrew(input);
  }

  async generateRecipe(input: Parameters<AiCoachModuleAdapter["generateRecipe"]>[0]): Promise<GeneratedRecipe> {
    const { createClient } = await import("@/lib/supabase/server");
    const { findOfficialRecipesForCoach } = await import("@/lib/data/official-recipes");
    const { officialRecipeToGenerated } = await import("@/lib/ai/official-recipe-coach");
    const supabase = await createClient();
    const matches = await findOfficialRecipesForCoach(supabase, {
      method: input.method,
      process: input.processing,
      roastLevel: input.roast,
      flavorPreference: input.flavorPreference ?? input.coffee ?? undefined,
      limit: 1,
    });
    if (matches.length > 0) {
      return officialRecipeToGenerated(matches[0]!);
    }
    return this.ruleBasedFallback.generateRecipe(input);
  }

  async analyzeSession(input: SessionAnalyzerInput): Promise<SessionAnalyzerResult> {
    return this.ruleBasedFallback.analyzeSession(input);
  }

  async answerKnowledge(question: string): Promise<string> {
    return this.ruleBasedFallback.answerKnowledge(question);
  }
}

export class AnthropicCoachModuleAdapter implements AiCoachModuleAdapter {
  readonly provider = "anthropic";
  constructor(private readonly apiKey: string | null) {}

  async chat(): Promise<AiCoachChatResponse> {
    if (!this.apiKey) throw new CoachModuleNotConfiguredError("anthropic");
    throw new CoachModuleNotConfiguredError("anthropic");
  }
  async brewDoctor(): Promise<BrewDoctorResult> {
    throw new CoachModuleNotConfiguredError("anthropic");
  }
  async guidedBrew(): Promise<GuidedBrewResult> {
    throw new CoachModuleNotConfiguredError("anthropic");
  }
  async generateRecipe(): Promise<GeneratedRecipe> {
    throw new CoachModuleNotConfiguredError("anthropic");
  }
  async analyzeSession(): Promise<SessionAnalyzerResult> {
    throw new CoachModuleNotConfiguredError("anthropic");
  }
  async answerKnowledge(): Promise<string> {
    throw new CoachModuleNotConfiguredError("anthropic");
  }
}

export class GeminiCoachModuleAdapter implements AiCoachModuleAdapter {
  readonly provider = "gemini";
  constructor(private readonly apiKey: string | null) {}

  async chat(): Promise<AiCoachChatResponse> {
    if (!this.apiKey) throw new CoachModuleNotConfiguredError("gemini");
    throw new CoachModuleNotConfiguredError("gemini");
  }
  async brewDoctor(): Promise<BrewDoctorResult> {
    throw new CoachModuleNotConfiguredError("gemini");
  }
  async guidedBrew(): Promise<GuidedBrewResult> {
    throw new CoachModuleNotConfiguredError("gemini");
  }
  async generateRecipe(): Promise<GeneratedRecipe> {
    throw new CoachModuleNotConfiguredError("gemini");
  }
  async analyzeSession(): Promise<SessionAnalyzerResult> {
    throw new CoachModuleNotConfiguredError("gemini");
  }
  async answerKnowledge(): Promise<string> {
    throw new CoachModuleNotConfiguredError("gemini");
  }
}

export class OpenRouterCoachModuleAdapter implements AiCoachModuleAdapter {
  readonly provider = "openrouter";
  constructor(private readonly apiKey: string | null) {}

  async chat(): Promise<AiCoachChatResponse> {
    if (!this.apiKey) throw new CoachModuleNotConfiguredError("openrouter");
    throw new CoachModuleNotConfiguredError("openrouter");
  }
  async brewDoctor(): Promise<BrewDoctorResult> {
    throw new CoachModuleNotConfiguredError("openrouter");
  }
  async guidedBrew(): Promise<GuidedBrewResult> {
    throw new CoachModuleNotConfiguredError("openrouter");
  }
  async generateRecipe(): Promise<GeneratedRecipe> {
    throw new CoachModuleNotConfiguredError("openrouter");
  }
  async analyzeSession(): Promise<SessionAnalyzerResult> {
    throw new CoachModuleNotConfiguredError("openrouter");
  }
  async answerKnowledge(): Promise<string> {
    throw new CoachModuleNotConfiguredError("openrouter");
  }
}

type CoachModuleProvider = "none" | "rule-based" | "openai" | "anthropic" | "gemini" | "openrouter";

const API_KEY_ENV: Record<Exclude<CoachModuleProvider, "none" | "rule-based">, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
};

export function getCoachModuleProvider(): CoachModuleProvider {
  return (process.env.AI_COACH_MODULE_PROVIDER ?? "rule-based").toLowerCase() as CoachModuleProvider;
}

export function isCoachModuleStreamingEnabled(): boolean {
  const provider = getCoachModuleProvider();
  return provider === "openai" && Boolean(process.env[API_KEY_ENV.openai]);
}

export function getCoachModuleAdapter(preferences?: AiCoachPreferences | null): AiCoachModuleAdapter {
  const provider = getCoachModuleProvider();

  switch (provider) {
    case "openai":
      return new OpenAICoachModuleAdapter(process.env[API_KEY_ENV.openai] ?? null, preferences ?? null);
    case "anthropic":
      return new AnthropicCoachModuleAdapter(process.env[API_KEY_ENV.anthropic] ?? null);
    case "gemini":
      return new GeminiCoachModuleAdapter(process.env[API_KEY_ENV.gemini] ?? null);
    case "openrouter":
      return new OpenRouterCoachModuleAdapter(process.env[API_KEY_ENV.openrouter] ?? null);
    case "rule-based":
    default:
      return new RuleBasedCoachModuleAdapter(preferences ?? null);
  }
}

export function formatBrewDoctorMarkdown(result: BrewDoctorResult): string {
  return formatBrewDoctorResponse(result);
}

export function formatGuidedBrewMarkdown(result: GuidedBrewResult): string {
  return formatGuidedBrewResponse(result);
}

export function formatRecipeMarkdown(recipe: GeneratedRecipe): string {
  return formatRecipeResponse(recipe);
}

export function formatAnalyzerMarkdown(result: SessionAnalyzerResult): string {
  return formatSessionAnalyzerResponse(result);
}
