import {
  CoachModuleApiError,
  CoachModuleRateLimitError,
  CoachModuleTimeoutError,
} from "@/lib/ai/coach-module-errors";
import type { OpenAiResponseInputMessage } from "@/lib/ai/coach-module-prompts";

export const OPENAI_RESPONSES_ENDPOINT = "https://api.openai.com/v1/responses";

export type OpenAiResponsesRequest = {
  model: string;
  instructions: string;
  input: string | OpenAiResponseInputMessage[];
  stream?: boolean;
  maxOutputTokens?: number;
};

export type OpenAiResponsesClientOptions = {
  apiKey: string;
  timeoutMs?: number;
  /** Hook invoked when OpenAI returns HTTP 429 — for external rate-limit telemetry. */
  onRateLimit?: (retryAfterMs?: number) => void;
};

type OpenAiErrorPayload = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

function parseTimeoutMs(): number {
  const raw = process.env.OPENAI_COACH_TIMEOUT_MS;
  if (!raw) return 60_000;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60_000;
}

function defaultModel(): string {
  return process.env.OPENAI_COACH_MODEL?.trim() || "gpt-4o-mini";
}

function parseRetryAfterMs(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number.parseInt(header, 10);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000;
  const dateMs = Date.parse(header);
  if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now());
  return undefined;
}

async function parseErrorResponse(response: Response): Promise<CoachModuleApiError> {
  let message = `OpenAI request failed (${response.status})`;
  try {
    const payload = (await response.json()) as OpenAiErrorPayload;
    if (payload.error?.message) message = payload.error.message;
  } catch {
    // ignore JSON parse errors
  }

  if (response.status === 429) {
    return new CoachModuleRateLimitError();
  }

  if (response.status === 401 || response.status === 403) {
    return new CoachModuleApiError(message, {
      userMessage: "OpenAI authentication failed. Check that OPENAI_API_KEY is valid.",
      status: response.status,
    });
  }

  return new CoachModuleApiError(message, {
    userMessage:
      response.status >= 500
        ? "The AI Coach provider is temporarily unavailable. Please try again."
        : "The AI Coach could not process your message. Please try again.",
    status: response.status,
    retryable: response.status >= 500 || response.status === 429,
  });
}

export function extractOutputText(payload: Record<string, unknown>): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  const output = payload.output;
  if (!Array.isArray(output)) return "";

  const parts: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const content = record.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (!block || typeof block !== "object") continue;
        const blockRecord = block as Record<string, unknown>;
        if (blockRecord.type === "output_text" && typeof blockRecord.text === "string") {
          parts.push(blockRecord.text);
        }
      }
    }
  }

  return parts.join("");
}

function parseSseEvents(buffer: string): { events: Record<string, unknown>[]; remainder: string } {
  const events: Record<string, unknown>[] = [];
  const chunks = buffer.split("\n\n");
  const remainder = chunks.pop() ?? "";

  for (const chunk of chunks) {
    const dataLines = chunk
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());

    if (dataLines.length === 0) continue;

    const data = dataLines.join("\n");
    if (data === "[DONE]") continue;

    try {
      events.push(JSON.parse(data) as Record<string, unknown>);
    } catch {
      // skip malformed SSE payloads
    }
  }

  return { events, remainder };
}

export class OpenAiResponsesClient {
  readonly model: string;
  private readonly timeoutMs: number;

  constructor(private readonly options: OpenAiResponsesClientOptions) {
    this.model = defaultModel();
    this.timeoutMs = options.timeoutMs ?? parseTimeoutMs();
  }

  private async post(body: OpenAiResponsesRequest, stream: boolean): Promise<Response> {
    const signal = AbortSignal.timeout(this.timeoutMs);

    try {
      const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          "Content-Type": "application/json",
          Accept: stream ? "text/event-stream" : "application/json",
        },
        body: JSON.stringify({ ...body, stream }),
        signal,
      });

      if (response.status === 429) {
        this.options.onRateLimit?.(parseRetryAfterMs(response));
        throw new CoachModuleRateLimitError();
      }

      if (!response.ok) {
        throw await parseErrorResponse(response);
      }

      return response;
    } catch (error) {
      if (error instanceof CoachModuleApiError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new CoachModuleTimeoutError(this.timeoutMs);
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new CoachModuleTimeoutError(this.timeoutMs);
      }
      throw new CoachModuleApiError(error instanceof Error ? error.message : "OpenAI request failed", {
        userMessage: "Unable to reach the AI Coach provider. Please try again.",
        retryable: true,
      });
    }
  }

  async createResponse(request: Omit<OpenAiResponsesRequest, "stream">): Promise<string> {
    const response = await this.post({ ...request, model: request.model || this.model }, false);
    const payload = (await response.json()) as Record<string, unknown>;
    const text = extractOutputText(payload).trim();
    if (!text) {
      throw new CoachModuleApiError("OpenAI returned an empty response", {
        userMessage: "The AI Coach returned an empty response. Please try again.",
      });
    }
    return text;
  }

  async *streamResponse(request: Omit<OpenAiResponsesRequest, "stream">): AsyncGenerator<string> {
    const response = await this.post({ ...request, model: request.model || this.model }, true);
    if (!response.body) {
      throw new CoachModuleApiError("OpenAI streaming body missing", {
        userMessage: "The AI Coach stream could not be started. Please try again.",
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parsed = parseSseEvents(buffer);
      buffer = parsed.remainder;

      for (const event of parsed.events) {
        const type = typeof event.type === "string" ? event.type : "";

        if (type === "error") {
          const nested = event.error as { message?: string } | undefined;
          throw new CoachModuleApiError(nested?.message ?? "OpenAI stream error", {
            userMessage: "The AI Coach encountered an error while responding. Please try again.",
          });
        }

        if (type === "response.output_text.delta" && typeof event.delta === "string" && event.delta) {
          fullText += event.delta;
          yield event.delta;
        }

        if (type === "response.failed") {
          throw new CoachModuleApiError("OpenAI response failed", {
            userMessage: "The AI Coach could not complete your request. Please try again.",
          });
        }
      }
    }

    if (!fullText.trim()) {
      throw new CoachModuleApiError("OpenAI stream ended without content", {
        userMessage: "The AI Coach returned an empty response. Please try again.",
      });
    }
  }
}
