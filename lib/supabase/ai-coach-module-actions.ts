"use server";

import { revalidatePath } from "next/cache";
import { generateConversationTitle } from "@/lib/ai/coach-knowledge-engine";
import {
  formatAnalyzerMarkdown,
  formatBrewDoctorMarkdown,
  formatGuidedBrewMarkdown,
  formatRecipeMarkdown,
  getCoachModuleAdapter,
} from "@/lib/ai/coach-module-adapter";
import {
  addMessage,
  createBrewSession,
  createConversation,
  deleteBrewSession,
  deleteConversation,
  duplicateBrewSession,
  getConversation,
  getMessages,
  getPreferences,
  listBrewSessions,
  listConversations,
  setMessageFeedback,
  trackAnalyticsEvent,
  updateConversation,
  upsertPreferences,
} from "@/lib/data/ai-coach-module";
import { getMembershipSummary } from "@/lib/data/membership";
import { checkAiCoachAccess, incrementDailyUsage } from "@/lib/membership/ai-coach-limits";
import { isPremium } from "@/lib/membership/access";
import { createClient } from "@/lib/supabase/server";
import type {
  AiCoachBrewSession,
  AiCoachConversation,
  AiCoachMessage,
  AiCoachMode,
  AiCoachPreferences,
  BrewDoctorInput,
  BrewDoctorResult,
  GeneratedRecipe,
  GuidedBrewInput,
  GuidedBrewResult,
  SessionAnalyzerInput,
  SessionAnalyzerResult,
} from "@/types/ai-coach-module";

type ActionResult<T = void> = { error?: string; success?: string } & (T extends void ? object : { data?: T });

async function requireAuth() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "You must be signed in.", supabase, userId: null as null };
  return { supabase, userId: authData.user.id, error: null as null };
}

async function gateRequest(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const access = await checkAiCoachAccess(supabase, userId);
  if (!access.allowed) return { error: access.reason ?? "Access denied." };
  return { summary: access.summary };
}

async function afterSuccessfulRequest(userId: string, supabase: Awaited<ReturnType<typeof createClient>>, summary: Awaited<ReturnType<typeof getMembershipSummary>>) {
  if (!isPremium(summary)) {
    await incrementDailyUsage(supabase, userId);
  }
}

export async function sendChatMessageAction(
  message: string,
  conversationId?: string | null,
  mode: AiCoachMode = "chat",
): Promise<ActionResult<{ conversationId: string; messages: AiCoachMessage[] }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };

  const gate = await gateRequest(auth.userId, auth.supabase);
  if ("error" in gate && gate.error) return { error: gate.error };

  const prefs = await getPreferences(auth.supabase, auth.userId);
  const adapter = getCoachModuleAdapter(prefs);

  let conversation: AiCoachConversation;
  if (conversationId) {
    const existing = await getConversation(auth.supabase, conversationId, auth.userId);
    if (!existing) return { error: "Conversation not found." };
    conversation = existing;
  } else {
    conversation = await createConversation(auth.supabase, auth.userId, generateConversationTitle(message), mode);
    await trackAnalyticsEvent(auth.supabase, "chat_started", auth.userId, { mode });
  }

  const history = await getMessages(auth.supabase, conversation.id, auth.userId);
  await addMessage(auth.supabase, conversation.id, auth.userId, "user", message);

  const response = await adapter.chat({ message, conversationId: conversation.id, mode, history });
  await addMessage(auth.supabase, conversation.id, auth.userId, "assistant", response.content);

  if (history.length === 0) {
    await updateConversation(auth.supabase, conversation.id, auth.userId, {
      title: generateConversationTitle(message),
    });
  }

  await afterSuccessfulRequest(auth.userId, auth.supabase, gate.summary!);
  revalidatePath("/ai-coach");

  const allMessages = await getMessages(auth.supabase, conversation.id, auth.userId);
  return {
    success: "Message sent.",
    data: { conversationId: conversation.id, messages: allMessages },
  };
}

export async function listConversationsAction(search?: string): Promise<ActionResult<{ conversations: AiCoachConversation[] }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const conversations = await listConversations(auth.supabase, auth.userId, { search, limit: 50 });
  return { data: { conversations } };
}

export async function getConversationAction(conversationId: string): Promise<ActionResult<{ conversation: AiCoachConversation; messages: AiCoachMessage[] }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const conversation = await getConversation(auth.supabase, conversationId, auth.userId);
  if (!conversation) return { error: "Conversation not found." };
  const messages = await getMessages(auth.supabase, conversationId, auth.userId);
  return { data: { conversation, messages } };
}

export async function renameConversationAction(conversationId: string, title: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  await updateConversation(auth.supabase, conversationId, auth.userId, { title });
  revalidatePath("/ai-coach");
  return { success: "Conversation renamed." };
}

export async function pinConversationAction(conversationId: string, isPinned: boolean): Promise<ActionResult> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  await updateConversation(auth.supabase, conversationId, auth.userId, { isPinned });
  revalidatePath("/ai-coach");
  return { success: isPinned ? "Conversation pinned." : "Conversation unpinned." };
}

export async function deleteConversationAction(conversationId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  await deleteConversation(auth.supabase, conversationId, auth.userId);
  revalidatePath("/ai-coach");
  return { success: "Conversation deleted." };
}

export async function setMessageFeedbackAction(messageId: string, feedback: "like" | "dislike" | null): Promise<ActionResult> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  await setMessageFeedback(auth.supabase, messageId, auth.userId, feedback);
  return { success: "Feedback saved." };
}

export async function runBrewDoctorAction(input: BrewDoctorInput): Promise<ActionResult<{ result: BrewDoctorResult; markdown: string }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const gate = await gateRequest(auth.userId, auth.supabase);
  if ("error" in gate && gate.error) return { error: gate.error };

  const adapter = getCoachModuleAdapter();
  const result = await adapter.brewDoctor(input);
  await trackAnalyticsEvent(auth.supabase, "brew_analyzed", auth.userId, { type: "brew_doctor", symptom: input.symptom });
  await afterSuccessfulRequest(auth.userId, auth.supabase, gate.summary!);
  return { data: { result, markdown: formatBrewDoctorMarkdown(result) }, success: "Diagnosis complete." };
}

export async function runGuidedBrewAction(input: GuidedBrewInput): Promise<ActionResult<{ result: GuidedBrewResult; markdown: string }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const gate = await gateRequest(auth.userId, auth.supabase);
  if ("error" in gate && gate.error) return { error: gate.error };

  const adapter = getCoachModuleAdapter();
  const result = await adapter.guidedBrew(input);
  await trackAnalyticsEvent(auth.supabase, "recipe_generated", auth.userId, { type: "guided_brew" });
  await afterSuccessfulRequest(auth.userId, auth.supabase, gate.summary!);
  return { data: { result, markdown: formatGuidedBrewMarkdown(result) }, success: "Recommendations ready." };
}

export async function generateRecipeAction(
  input: import("@/types/ai-coach-module").RecipeGeneratorInput,
): Promise<ActionResult<{ recipe: GeneratedRecipe; markdown: string }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const gate = await gateRequest(auth.userId, auth.supabase);
  if ("error" in gate && gate.error) return { error: gate.error };

  const adapter = getCoachModuleAdapter();
  const recipe = await adapter.generateRecipe(input);
  await trackAnalyticsEvent(auth.supabase, "recipe_generated", auth.userId, { type: "recipe_generator" });
  await afterSuccessfulRequest(auth.userId, auth.supabase, gate.summary!);
  return { data: { recipe, markdown: formatRecipeMarkdown(recipe) }, success: "Recipe generated." };
}

export async function analyzeSessionAction(input: SessionAnalyzerInput): Promise<ActionResult<{ result: SessionAnalyzerResult; markdown: string }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const gate = await gateRequest(auth.userId, auth.supabase);
  if ("error" in gate && gate.error) return { error: gate.error };

  const adapter = getCoachModuleAdapter();
  const result = await adapter.analyzeSession(input);
  await trackAnalyticsEvent(auth.supabase, "brew_analyzed", auth.userId, { type: "session_analyzer" });
  await afterSuccessfulRequest(auth.userId, auth.supabase, gate.summary!);
  return { data: { result, markdown: formatAnalyzerMarkdown(result) }, success: "Analysis complete." };
}

export async function saveBrewSessionAction(
  session: Omit<AiCoachBrewSession, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<ActionResult<{ session: AiCoachBrewSession }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const saved = await createBrewSession(auth.supabase, auth.userId, session);
  await trackAnalyticsEvent(auth.supabase, "session_saved", auth.userId, { sessionId: saved.id });
  revalidatePath("/ai-coach/brew-memory");
  return { data: { session: saved }, success: "Session saved." };
}

export async function listBrewSessionsAction(search?: string): Promise<ActionResult<{ sessions: AiCoachBrewSession[] }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const sessions = await listBrewSessions(auth.supabase, auth.userId, { search });
  return { data: { sessions } };
}

export async function deleteBrewSessionAction(sessionId: string): Promise<ActionResult> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  await deleteBrewSession(auth.supabase, sessionId, auth.userId);
  revalidatePath("/ai-coach/brew-memory");
  return { success: "Session deleted." };
}

export async function duplicateBrewSessionAction(sessionId: string): Promise<ActionResult<{ session: AiCoachBrewSession }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const session = await duplicateBrewSession(auth.supabase, sessionId, auth.userId);
  revalidatePath("/ai-coach/brew-memory");
  return { data: { session }, success: "Session duplicated." };
}

export async function getPreferencesAction(): Promise<ActionResult<{ preferences: AiCoachPreferences | null }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const preferences = await getPreferences(auth.supabase, auth.userId);
  return { data: { preferences } };
}

export async function savePreferencesAction(
  prefs: Partial<Omit<AiCoachPreferences, "userId" | "updatedAt">>,
): Promise<ActionResult<{ preferences: AiCoachPreferences }>> {
  const auth = await requireAuth();
  if (auth.error || !auth.userId) return { error: auth.error ?? "Not signed in." };
  const preferences = await upsertPreferences(auth.supabase, auth.userId, prefs);
  return { data: { preferences }, success: "Preferences saved." };
}

export async function trackAiCoachEventAction(eventName: string, eventData?: Record<string, unknown>): Promise<void> {
  const auth = await requireAuth();
  if (!auth.userId) return;
  await trackAnalyticsEvent(auth.supabase, eventName, auth.userId, eventData);
}

export async function getAiCoachAccessAction(): Promise<{
  isAuthenticated: boolean;
  isPremium: boolean;
  usage: { used: number; limit: number | null; remaining: number | null; isUnlimited: boolean };
  isEnabled: boolean;
}> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { isAuthenticated: false, isPremium: false, usage: { used: 0, limit: 5, remaining: 5, isUnlimited: false }, isEnabled: true };
  }
  const summary = await getMembershipSummary(supabase, authData.user.id);
  const { getAiCoachUsageSummary, getAiCoachSettings } = await import("@/lib/membership/ai-coach-limits");
  const [usage, settings] = await Promise.all([
    getAiCoachUsageSummary(supabase, authData.user.id, summary),
    getAiCoachSettings(supabase),
  ]);
  return {
    isAuthenticated: true,
    isPremium: isPremium(summary),
    usage,
    isEnabled: settings.isEnabled,
  };
}
