/**
 * Typed errors for the AI Coach module — configuration, API, and rate limits.
 */

export class CoachModuleNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      provider === "none"
        ? "No AI Coach provider configured. Set AI_COACH_MODULE_PROVIDER to enable LLM-backed features."
        : provider === "openai"
          ? "OpenAI is not configured. Set AI_COACH_MODULE_PROVIDER=openai and add OPENAI_API_KEY to your environment."
          : `The '${provider}' AI Coach adapter is structured but not yet wired to a real API.`,
    );
    this.name = "CoachModuleNotConfiguredError";
  }
}

export class CoachModuleApiError extends Error {
  readonly userMessage: string;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(message: string, options?: { userMessage?: string; status?: number; retryable?: boolean }) {
    super(message);
    this.name = "CoachModuleApiError";
    this.userMessage = options?.userMessage ?? "The AI Coach is temporarily unavailable. Please try again in a moment.";
    this.status = options?.status;
    this.retryable = options?.retryable ?? false;
  }
}

export class CoachModuleTimeoutError extends CoachModuleApiError {
  constructor(timeoutMs: number) {
    super(`OpenAI request timed out after ${timeoutMs}ms`, {
      userMessage: "The AI Coach took too long to respond. Please try again.",
      retryable: true,
    });
    this.name = "CoachModuleTimeoutError";
  }
}

export class CoachModuleRateLimitError extends CoachModuleApiError {
  constructor() {
    super("OpenAI rate limit exceeded", {
      userMessage: "The AI Coach is receiving too many requests. Please wait a moment and try again.",
      status: 429,
      retryable: true,
    });
    this.name = "CoachModuleRateLimitError";
  }
}

export function getCoachModuleErrorMessage(error: unknown): string {
  if (error instanceof CoachModuleNotConfiguredError) return error.message;
  if (error instanceof CoachModuleApiError) return error.userMessage;
  if (error instanceof Error && error.name === "AbortError") {
    return "The AI Coach request was cancelled or timed out. Please try again.";
  }
  return "Something went wrong while contacting the AI Coach. Please try again.";
}

export function isCoachModuleConfigurationError(error: unknown): boolean {
  return error instanceof CoachModuleNotConfiguredError;
}
