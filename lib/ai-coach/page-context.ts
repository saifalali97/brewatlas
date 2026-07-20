import { getMembershipSummary } from "@/lib/data/membership";
import { getCoachModuleProvider, isCoachModuleStreamingEnabled } from "@/lib/ai/coach-module-adapter";
import { getAiCoachUsageSummary, getAiCoachSettings, canMakeAiCoachRequest } from "@/lib/membership/ai-coach-limits";
import { listConversations } from "@/lib/data/ai-coach-module";
import { isPremium } from "@/lib/membership/access";
import { createClient } from "@/lib/supabase/server";

export type AiCoachPageContext = {
  isAuthenticated: boolean;
  isPremium: boolean;
  canUseAi: boolean;
  paywallReason?: string;
  usage: { used: number; limit: number | null; remaining: number | null; isUnlimited: boolean };
  isEnabled: boolean;
  userId: string | null;
  provider: string;
  streamingEnabled: boolean;
};

export async function getAiCoachPageContext(): Promise<AiCoachPageContext> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const settings = await getAiCoachSettings(supabase);

  if (!authData.user) {
    return {
      isAuthenticated: false,
      isPremium: false,
      canUseAi: false,
      paywallReason: "Sign in to use the AI Coach.",
      usage: { used: 0, limit: settings.freeDailyLimit, remaining: settings.freeDailyLimit, isUnlimited: false },
      isEnabled: settings.isEnabled,
      userId: null,
      provider: getCoachModuleProvider(),
      streamingEnabled: false,
    };
  }

  const summary = await getMembershipSummary(supabase, authData.user.id);
  const usage = await getAiCoachUsageSummary(supabase, authData.user.id, summary);
  const gate = await canMakeAiCoachRequest(supabase, authData.user.id, summary);

  return {
    isAuthenticated: true,
    isPremium: isPremium(summary),
    canUseAi: gate.allowed && settings.isEnabled,
    paywallReason: gate.reason,
    usage,
    isEnabled: settings.isEnabled,
    userId: authData.user.id,
    provider: getCoachModuleProvider(),
    streamingEnabled: isCoachModuleStreamingEnabled(),
  };
}

export async function getRecentConversations(userId: string) {
  const supabase = await createClient();
  return listConversations(supabase, userId, { limit: 5 });
}
