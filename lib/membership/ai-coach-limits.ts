import type { SupabaseClient } from "@supabase/supabase-js";
import { hasFeature, isPremium } from "@/lib/membership/access";
import type { MembershipSummary } from "@/types/membership";
import type { AiCoachSettings, AiCoachUsageSummary } from "@/types/ai-coach-module";

const DEFAULT_FREE_DAILY_LIMIT = 5;

/** Checks if AI Coach is globally enabled via settings table. */
export async function getAiCoachSettings(supabase: SupabaseClient): Promise<AiCoachSettings> {
  const { data } = await supabase.from("ai_coach_settings").select("is_enabled, free_daily_limit").limit(1).maybeSingle();
  return {
    isEnabled: data?.is_enabled ?? true,
    freeDailyLimit: data?.free_daily_limit ?? DEFAULT_FREE_DAILY_LIMIT,
  };
}

/** Gets today's usage count for a user. */
export async function getDailyUsageCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("ai_coach_daily_usage")
    .select("request_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();
  return data?.request_count ?? 0;
}

/** Resolves AI Coach usage summary for gating UI. */
export async function getAiCoachUsageSummary(
  supabase: SupabaseClient,
  userId: string,
  summary: MembershipSummary | null,
): Promise<AiCoachUsageSummary> {
  if (isPremium(summary)) {
    return { used: 0, limit: null, remaining: null, isUnlimited: true };
  }

  const settings = await getAiCoachSettings(supabase);
  const used = await getDailyUsageCount(supabase, userId);
  const limit = settings.freeDailyLimit;
  const remaining = Math.max(0, limit - used);

  return { used, limit, remaining, isUnlimited: false };
}

/** Returns true if the user can make another AI Coach request. */
export async function canMakeAiCoachRequest(
  supabase: SupabaseClient,
  userId: string,
  summary: MembershipSummary | null,
): Promise<{ allowed: boolean; reason?: string }> {
  const settings = await getAiCoachSettings(supabase);
  if (!settings.isEnabled) {
    return { allowed: false, reason: "AI Coach is temporarily unavailable." };
  }

  if (isPremium(summary)) return { allowed: true };

  if (!summary || !hasFeature(summary, "ai_coach")) {
    return { allowed: false, reason: "The AI Coach requires a free or Premium account. Sign in to get started." };
  }

  const usage = await getAiCoachUsageSummary(supabase, userId, summary);
  if (!usage.isUnlimited && usage.remaining !== null && usage.remaining <= 0) {
    return { allowed: false, reason: "Daily AI request limit reached. Upgrade to Premium for unlimited access." };
  }

  return { allowed: true };
}

/** Increments daily usage counter for free-tier users. */
export async function incrementDailyUsage(supabase: SupabaseClient, userId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("ai_coach_daily_usage")
    .select("id, request_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("ai_coach_daily_usage")
      .update({ request_count: existing.request_count + 1, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
  } else {
    await supabase.from("ai_coach_daily_usage").insert({ user_id: userId, usage_date: today, request_count: 1 });
  }
}

/** Convenience: fetch membership + check access in one call. */
export async function checkAiCoachAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ allowed: boolean; reason?: string; summary: MembershipSummary | null }> {
  const { getMembershipSummary } = await import("@/lib/data/membership");
  const summary = await getMembershipSummary(supabase, userId);
  const gate = await canMakeAiCoachRequest(supabase, userId, summary);
  return { ...gate, summary };
}
