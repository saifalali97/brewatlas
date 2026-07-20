import { generateConversationTitle } from "@/lib/ai/coach-knowledge-engine";
import { getCoachModuleAdapter, isCoachModuleStreamingEnabled } from "@/lib/ai/coach-module-adapter";
import { findOfficialRecipesForCoach } from "@/lib/data/official-recipes";
import { buildOfficialRecipeCoachContext } from "@/lib/ai/official-recipe-coach";
import { getCoachModuleErrorMessage } from "@/lib/ai/coach-module-errors";
import {
  addMessage,
  createConversation,
  getConversation,
  getMessages,
  getPreferences,
  trackAnalyticsEvent,
  updateConversation,
} from "@/lib/data/ai-coach-module";
import { getMembershipSummary } from "@/lib/data/membership";
import { checkAiCoachAccess, incrementDailyUsage } from "@/lib/membership/ai-coach-limits";
import { isPremium } from "@/lib/membership/access";
import { createClient } from "@/lib/supabase/server";
import type { AiCoachConversation, AiCoachMessage, AiCoachMode } from "@/types/ai-coach-module";

export type CoachChatTurnResult =
  | {
      ok: true;
      conversation: AiCoachConversation;
      history: AiCoachMessage[];
      summary: Awaited<ReturnType<typeof getMembershipSummary>>;
      userId: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
      officialRecipesContext: string;
    }
  | { ok: false; error: string; status?: number };

export async function prepareCoachChatTurn(
  message: string,
  conversationId: string | null | undefined,
  mode: AiCoachMode = "chat",
): Promise<CoachChatTurnResult> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { ok: false, error: "You must be signed in.", status: 401 };
  }

  const userId = authData.user.id;
  const access = await checkAiCoachAccess(supabase, userId);
  if (!access.allowed || !access.summary) {
    return { ok: false, error: access.reason ?? "Access denied.", status: 403 };
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return { ok: false, error: "Please enter a message.", status: 400 };
  }

  let conversation: AiCoachConversation;
  let history: AiCoachMessage[];
  try {
    if (conversationId) {
      const existing = await getConversation(supabase, conversationId, userId);
      if (!existing) return { ok: false, error: "Conversation not found.", status: 404 };
      conversation = existing;
    } else {
      conversation = await createConversation(supabase, userId, generateConversationTitle(trimmed), mode);
      await trackAnalyticsEvent(supabase, "chat_started", userId, { mode });
    }

    history = await getMessages(supabase, conversation.id, userId);
    await addMessage(supabase, conversation.id, userId, "user", trimmed);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to prepare chat.",
      status: 500,
    };
  }

  const officialMatches = await findOfficialRecipesForCoach(supabase, {
    method: mode === "recipe_generator" ? trimmed : undefined,
    flavorPreference: trimmed,
    limit: 3,
  });
  const officialRecipesContext = buildOfficialRecipeCoachContext(officialMatches);

  return {
    ok: true,
    conversation,
    history,
    summary: access.summary,
    userId,
    supabase,
    officialRecipesContext,
  };
}

export async function completeCoachChatTurn(params: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  conversation: AiCoachConversation;
  history: AiCoachMessage[];
  assistantContent: string;
  summary: Awaited<ReturnType<typeof getMembershipSummary>>;
  firstMessage: string;
}) {
  const { supabase, userId, conversation, history, assistantContent, summary, firstMessage } = params;

  await addMessage(supabase, conversation.id, userId, "assistant", assistantContent);

  if (history.length === 0) {
    await updateConversation(supabase, conversation.id, userId, {
      title: generateConversationTitle(firstMessage),
    });
  }

  if (!isPremium(summary)) {
    await incrementDailyUsage(supabase, userId);
  }

  return getMessages(supabase, conversation.id, userId);
}

export async function runCoachChatCompletion(
  message: string,
  conversationId: string | null | undefined,
  mode: AiCoachMode = "chat",
): Promise<
  | { ok: false; error: string; status?: number }
  | { ok: true; conversationId: string; messages: AiCoachMessage[] }
> {
  const prepared = await prepareCoachChatTurn(message, conversationId, mode);
  if (!prepared.ok) return { ok: false, error: prepared.error, status: prepared.status };

  const prefs = await getPreferences(prepared.supabase, prepared.userId);
  const adapter = getCoachModuleAdapter(prefs);

  try {
    const response = await adapter.chat({
      message,
      conversationId: prepared.conversation.id,
      mode,
      history: prepared.history,
      context: {
        officialRecipes: prepared.officialRecipesContext,
      },
    });

    const messages = await completeCoachChatTurn({
      supabase: prepared.supabase,
      userId: prepared.userId,
      conversation: prepared.conversation,
      history: prepared.history,
      assistantContent: response.content,
      summary: prepared.summary,
      firstMessage: message,
    });

    return { ok: true, conversationId: prepared.conversation.id, messages };
  } catch (error) {
    return { ok: false, error: getCoachModuleErrorMessage(error), status: 500 };
  }
}

export function coachChatSupportsStreaming(): boolean {
  return isCoachModuleStreamingEnabled();
}
