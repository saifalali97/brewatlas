import { generateChatResponse } from "@/lib/ai/coach-knowledge-engine";
import { diagnoseBrew, formatBrewDoctorResponse } from "@/lib/ai/brew-doctor-engine";
import { formatGuidedBrewResponse, formatRecipeResponse, generatePersonalizedRecipe, runGuidedBrew } from "@/lib/ai/guided-brew-engine";
import { analyzeBrewSession, formatSessionAnalyzerResponse } from "@/lib/ai/session-analyzer-engine";
import type {
  AiCoachChatRequest,
  AiCoachChatResponse,
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
    const { answerKnowledgeQuestion } = await import("@/lib/ai/coach-knowledge-engine");
    return answerKnowledgeQuestion(question);
  }
}

export class CoachModuleNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      provider === "none"
        ? "No AI Coach provider configured. Set AI_COACH_MODULE_PROVIDER to enable LLM-backed features."
        : `The '${provider}' AI Coach adapter is structured but not yet wired to a real API.`,
    );
    this.name = "CoachModuleNotConfiguredError";
  }
}

export class OpenAICoachModuleAdapter implements AiCoachModuleAdapter {
  readonly provider = "openai";
  constructor(private readonly apiKey: string | null) {}

  async chat(): Promise<AiCoachChatResponse> {
    if (!this.apiKey) throw new CoachModuleNotConfiguredError("openai");
    throw new CoachModuleNotConfiguredError("openai");
  }
  async brewDoctor(): Promise<BrewDoctorResult> {
    throw new CoachModuleNotConfiguredError("openai");
  }
  async guidedBrew(): Promise<GuidedBrewResult> {
    throw new CoachModuleNotConfiguredError("openai");
  }
  async generateRecipe(): Promise<GeneratedRecipe> {
    throw new CoachModuleNotConfiguredError("openai");
  }
  async analyzeSession(): Promise<SessionAnalyzerResult> {
    throw new CoachModuleNotConfiguredError("openai");
  }
  async answerKnowledge(): Promise<string> {
    throw new CoachModuleNotConfiguredError("openai");
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

export function getCoachModuleAdapter(preferences?: AiCoachPreferences | null): AiCoachModuleAdapter {
  const provider = (process.env.AI_COACH_MODULE_PROVIDER ?? "rule-based").toLowerCase() as CoachModuleProvider;

  switch (provider) {
    case "openai":
      return new OpenAICoachModuleAdapter(process.env[API_KEY_ENV.openai] ?? null);
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
