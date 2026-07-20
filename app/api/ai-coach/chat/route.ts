import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  completeCoachChatTurn,
  prepareCoachChatTurn,
} from "@/lib/ai/coach-chat-service";
import { getCoachModuleAdapter, isCoachModuleStreamingEnabled } from "@/lib/ai/coach-module-adapter";
import { getCoachModuleErrorMessage } from "@/lib/ai/coach-module-errors";
import { getPreferences } from "@/lib/data/ai-coach-module";
import { captureError } from "@/lib/observability/capture-error";
import { verifySameOrigin } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import type { AiCoachMode } from "@/types/ai-coach-module";

export const runtime = "nodejs";

type ChatRequestBody = {
  message?: string;
  conversationId?: string | null;
  mode?: AiCoachMode;
};

function sseLine(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`${ip}:chat`, RATE_LIMITS.aiCoach);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many AI Coach requests. Please wait a moment." }, { status: 429 });
  }

  if (!isCoachModuleStreamingEnabled()) {
    return NextResponse.json(
      { error: "Streaming is available when AI_COACH_MODULE_PROVIDER=openai and OPENAI_API_KEY is configured." },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message : "";
  const conversationId = body.conversationId ?? null;
  const mode = body.mode ?? "chat";

  const prepared = await prepareCoachChatTurn(message, conversationId, mode);
  if (!prepared.ok) {
    return NextResponse.json({ error: prepared.error }, { status: prepared.status ?? 400 });
  }

  const prefs = await getPreferences(prepared.supabase, prepared.userId);
  const adapter = getCoachModuleAdapter(prefs);

  if (!adapter.supportsStreaming || typeof adapter.chatStream !== "function") {
    return NextResponse.json({ error: "Streaming is not supported by the active provider." }, { status: 503 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let fullText = "";

      try {
        controller.enqueue(
          encoder.encode(
            sseLine("meta", {
              conversationId: prepared.conversation.id,
            }),
          ),
        );

        for await (const chunk of adapter.chatStream!({
          message,
          conversationId: prepared.conversation.id,
          mode,
          history: prepared.history,
          context: {
            officialRecipes: prepared.officialRecipesContext,
            brewingSetup: prepared.brewingSetupContext,
          },
        })) {
          if (chunk.type === "delta") {
            fullText += chunk.content;
            controller.enqueue(encoder.encode(sseLine("delta", { content: chunk.content })));
          } else if (chunk.type === "done") {
            fullText = chunk.content;
          }
        }

        const messages = await completeCoachChatTurn({
          supabase: prepared.supabase,
          userId: prepared.userId,
          conversation: prepared.conversation,
          history: prepared.history,
          assistantContent: fullText,
          summary: prepared.summary,
          firstMessage: message,
        });

        revalidatePath("/ai-coach");

        controller.enqueue(
          encoder.encode(
            sseLine("done", {
              conversationId: prepared.conversation.id,
              messages,
            }),
          ),
        );
        controller.close();
      } catch (error) {
        captureError(error, { source: "api.ai-coach.chat" });
        controller.enqueue(encoder.encode(sseLine("error", { error: getCoachModuleErrorMessage(error) })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
