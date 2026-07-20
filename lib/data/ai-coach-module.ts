import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AiCoachBrewSession,
  AiCoachConversation,
  AiCoachMessage,
  AiCoachMode,
  AiCoachPreferences,
  AiCoachSettings,
} from "@/types/ai-coach-module";

type DbConversation = {
  id: string;
  user_id: string;
  title: string;
  mode: string;
  is_pinned: boolean;
  is_favorite: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type DbMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: string;
  content: string;
  feedback: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type DbBrewSession = {
  id: string;
  user_id: string;
  title: string;
  recipe: Record<string, unknown>;
  coffee: string | null;
  grinder: string | null;
  water: string | null;
  temperature_c: number | null;
  rating: number | null;
  taste_notes: string | null;
  adjustments: string | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

type DbPreferences = {
  user_id: string;
  favorite_brewer: string | null;
  favorite_grinder: string | null;
  favorite_roast: string | null;
  favorite_origin: string | null;
  favorite_ratio: string | null;
  preferred_language: string;
  experience_level: string | null;
  updated_at: string;
};

function mapConversation(row: DbConversation): AiCoachConversation {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    mode: row.mode as AiCoachMode,
    isPinned: row.is_pinned,
    isFavorite: row.is_favorite,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMessage(row: DbMessage): AiCoachMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    userId: row.user_id,
    role: row.role as AiCoachMessage["role"],
    content: row.content,
    feedback: row.feedback as AiCoachMessage["feedback"],
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function mapBrewSession(row: DbBrewSession): AiCoachBrewSession {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    recipe: row.recipe ?? {},
    coffee: row.coffee,
    grinder: row.grinder,
    water: row.water,
    temperatureC: row.temperature_c,
    rating: row.rating,
    tasteNotes: row.taste_notes,
    adjustments: row.adjustments,
    notes: row.notes,
    isFavorite: row.is_favorite,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPreferences(row: DbPreferences): AiCoachPreferences {
  return {
    userId: row.user_id,
    favoriteBrewer: row.favorite_brewer,
    favoriteGrinder: row.favorite_grinder,
    favoriteRoast: row.favorite_roast,
    favoriteOrigin: row.favorite_origin,
    favoriteRatio: row.favorite_ratio,
    preferredLanguage: row.preferred_language,
    experienceLevel: row.experience_level as AiCoachPreferences["experienceLevel"],
    updatedAt: row.updated_at,
  };
}

export async function getAiCoachSettingsFromDb(supabase: SupabaseClient): Promise<AiCoachSettings> {
  const { data } = await supabase.from("ai_coach_settings").select("is_enabled, free_daily_limit").limit(1).maybeSingle();
  return { isEnabled: data?.is_enabled ?? true, freeDailyLimit: data?.free_daily_limit ?? 5 };
}

export async function updateAiCoachSettings(
  supabase: SupabaseClient,
  settings: Partial<AiCoachSettings>,
  adminUserId: string,
): Promise<void> {
  const { data: existing } = await supabase.from("ai_coach_settings").select("id").limit(1).maybeSingle();
  const payload = {
    ...(settings.isEnabled !== undefined && { is_enabled: settings.isEnabled }),
    ...(settings.freeDailyLimit !== undefined && { free_daily_limit: settings.freeDailyLimit }),
    updated_at: new Date().toISOString(),
    updated_by: adminUserId,
  };
  if (existing) {
    await supabase.from("ai_coach_settings").update(payload).eq("id", existing.id);
  }
}

export async function getPreferences(supabase: SupabaseClient, userId: string): Promise<AiCoachPreferences | null> {
  const { data } = await supabase.from("ai_coach_preferences").select("*").eq("user_id", userId).maybeSingle();
  return data ? mapPreferences(data as DbPreferences) : null;
}

export async function upsertPreferences(
  supabase: SupabaseClient,
  userId: string,
  prefs: Partial<Omit<AiCoachPreferences, "userId" | "updatedAt">>,
): Promise<AiCoachPreferences> {
  const payload = {
    user_id: userId,
    favorite_brewer: prefs.favoriteBrewer,
    favorite_grinder: prefs.favoriteGrinder,
    favorite_roast: prefs.favoriteRoast,
    favorite_origin: prefs.favoriteOrigin,
    favorite_ratio: prefs.favoriteRatio,
    preferred_language: prefs.preferredLanguage ?? "en",
    experience_level: prefs.experienceLevel,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("ai_coach_preferences").upsert(payload).select("*").single();
  if (error || !data) throw new Error("Failed to save preferences.");
  return mapPreferences(data as DbPreferences);
}

export async function listConversations(
  supabase: SupabaseClient,
  userId: string,
  options?: { search?: string; limit?: number; offset?: number },
): Promise<AiCoachConversation[]> {
  let query = supabase
    .from("ai_coach_conversations")
    .select("*")
    .eq("user_id", userId)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (options?.search) query = query.ilike("title", `%${options.search}%`);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);

  const { data } = await query;
  return (data ?? []).map((row) => mapConversation(row as DbConversation));
}

export async function getConversation(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
): Promise<AiCoachConversation | null> {
  const { data } = await supabase
    .from("ai_coach_conversations")
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? mapConversation(data as DbConversation) : null;
}

export async function createConversation(
  supabase: SupabaseClient,
  userId: string,
  title: string,
  mode: AiCoachMode = "chat",
): Promise<AiCoachConversation> {
  const { data, error } = await supabase
    .from("ai_coach_conversations")
    .insert({ user_id: userId, title, mode })
    .select("*")
    .single();
  if (error || !data) {
    const detail = error?.message ?? "unknown error";
    const code = error?.code ? ` (${error.code})` : "";
    throw new Error(`Failed to create conversation${code}: ${detail}`);
  }
  return mapConversation(data as DbConversation);
}

export async function updateConversation(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
  updates: Partial<Pick<AiCoachConversation, "title" | "isPinned" | "isFavorite">>,
): Promise<void> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.isPinned !== undefined) payload.is_pinned = updates.isPinned;
  if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite;
  await supabase.from("ai_coach_conversations").update(payload).eq("id", conversationId).eq("user_id", userId);
}

export async function deleteConversation(supabase: SupabaseClient, conversationId: string, userId: string): Promise<void> {
  await supabase.from("ai_coach_conversations").delete().eq("id", conversationId).eq("user_id", userId);
}

export async function getMessages(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
): Promise<AiCoachMessage[]> {
  const { data } = await supabase
    .from("ai_coach_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((row) => mapMessage(row as DbMessage));
}

export async function addMessage(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
  role: AiCoachMessage["role"],
  content: string,
  metadata?: Record<string, unknown>,
): Promise<AiCoachMessage> {
  const { data, error } = await supabase
    .from("ai_coach_messages")
    .insert({ conversation_id: conversationId, user_id: userId, role, content, metadata: metadata ?? {} })
    .select("*")
    .single();
  if (error || !data) throw new Error("Failed to add message.");

  await supabase
    .from("ai_coach_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return mapMessage(data as DbMessage);
}

export async function setMessageFeedback(
  supabase: SupabaseClient,
  messageId: string,
  userId: string,
  feedback: AiCoachMessage["feedback"],
): Promise<void> {
  await supabase.from("ai_coach_messages").update({ feedback }).eq("id", messageId).eq("user_id", userId);
}

export async function listBrewSessions(
  supabase: SupabaseClient,
  userId: string,
  options?: { search?: string; favoritesOnly?: boolean },
): Promise<AiCoachBrewSession[]> {
  let query = supabase
    .from("ai_coach_brew_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options?.favoritesOnly) query = query.eq("is_favorite", true);
  if (options?.search) query = query.or(`title.ilike.%${options.search}%,coffee.ilike.%${options.search}%,notes.ilike.%${options.search}%`);

  const { data } = await query;
  return (data ?? []).map((row) => mapBrewSession(row as DbBrewSession));
}

export async function createBrewSession(
  supabase: SupabaseClient,
  userId: string,
  session: Omit<AiCoachBrewSession, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<AiCoachBrewSession> {
  const { data, error } = await supabase
    .from("ai_coach_brew_sessions")
    .insert({
      user_id: userId,
      title: session.title,
      recipe: session.recipe,
      coffee: session.coffee,
      grinder: session.grinder,
      water: session.water,
      temperature_c: session.temperatureC,
      rating: session.rating,
      taste_notes: session.tasteNotes,
      adjustments: session.adjustments,
      notes: session.notes,
      is_favorite: session.isFavorite,
    })
    .select("*")
    .single();
  if (error || !data) throw new Error("Failed to save brew session.");
  return mapBrewSession(data as DbBrewSession);
}

export async function deleteBrewSession(supabase: SupabaseClient, sessionId: string, userId: string): Promise<void> {
  await supabase.from("ai_coach_brew_sessions").delete().eq("id", sessionId).eq("user_id", userId);
}

export async function duplicateBrewSession(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string,
): Promise<AiCoachBrewSession> {
  const { data: original } = await supabase
    .from("ai_coach_brew_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!original) throw new Error("Session not found.");
  const row = original as DbBrewSession;
  return createBrewSession(supabase, userId, {
    title: `${row.title} (copy)`,
    recipe: row.recipe,
    coffee: row.coffee,
    grinder: row.grinder,
    water: row.water,
    temperatureC: row.temperature_c,
    rating: row.rating,
    tasteNotes: row.taste_notes,
    adjustments: row.adjustments,
    notes: row.notes,
    isFavorite: false,
  });
}

export async function trackAnalyticsEvent(
  supabase: SupabaseClient,
  eventName: string,
  userId: string | null,
  eventData?: Record<string, unknown>,
): Promise<void> {
  await supabase.from("ai_coach_analytics_events").insert({
    user_id: userId,
    event_name: eventName,
    event_data: eventData ?? {},
  });
}

export async function getAnalyticsStats(supabase: SupabaseClient): Promise<{
  totalEvents: number;
  chatStarted: number;
  recipesGenerated: number;
  brewsAnalyzed: number;
  sessionsSaved: number;
}> {
  const { count: totalEvents } = await supabase.from("ai_coach_analytics_events").select("*", { count: "exact", head: true });

  const countByEvent = async (name: string) => {
    const { count } = await supabase
      .from("ai_coach_analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", name);
    return count ?? 0;
  };

  const [chatStarted, recipesGenerated, brewsAnalyzed, sessionsSaved] = await Promise.all([
    countByEvent("chat_started"),
    countByEvent("recipe_generated"),
    countByEvent("brew_analyzed"),
    countByEvent("session_saved"),
  ]);

  return { totalEvents: totalEvents ?? 0, chatStarted, recipesGenerated, brewsAnalyzed, sessionsSaved };
}
