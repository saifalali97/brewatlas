import type { AiCoachMessage } from "@/types/ai-coach-module";

export type CoachChatStreamResult = {
  conversationId: string;
  messages: AiCoachMessage[];
};

type StreamHandlers = {
  onMeta?: (conversationId: string) => void;
  onDelta?: (content: string) => void;
};

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split("\n");
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

/** Stream AI Coach chat responses from `/api/ai-coach/chat`. */
export async function streamCoachChatMessage(
  message: string,
  conversationId: string | null,
  handlers: StreamHandlers = {},
): Promise<CoachChatStreamResult> {
  const response = await fetch("/api/ai-coach/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, conversationId }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Unable to reach the AI Coach.");
  }

  if (!response.body) {
    throw new Error("The AI Coach stream could not be started.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let resolvedConversationId = conversationId ?? "";
  let finalMessages: AiCoachMessage[] | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const parsed = parseSseBlock(chunk);
      if (!parsed) continue;

      const payload = JSON.parse(parsed.data) as Record<string, unknown>;

      if (parsed.event === "meta" && typeof payload.conversationId === "string") {
        resolvedConversationId = payload.conversationId;
        handlers.onMeta?.(resolvedConversationId);
      }

      if (parsed.event === "delta" && typeof payload.content === "string") {
        handlers.onDelta?.(payload.content);
      }

      if (parsed.event === "done") {
        if (typeof payload.conversationId === "string") {
          resolvedConversationId = payload.conversationId;
        }
        if (Array.isArray(payload.messages)) {
          finalMessages = payload.messages as AiCoachMessage[];
        }
      }

      if (parsed.event === "error" && typeof payload.error === "string") {
        throw new Error(payload.error);
      }
    }
  }

  if (!finalMessages) {
    throw new Error("The AI Coach stream ended unexpectedly.");
  }

  return {
    conversationId: resolvedConversationId,
    messages: finalMessages,
  };
}
