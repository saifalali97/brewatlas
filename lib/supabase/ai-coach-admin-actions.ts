"use server";

import { revalidatePath } from "next/cache";
import { updateAiCoachSettings } from "@/lib/data/ai-coach-module";
import { createClient } from "@/lib/supabase/server";
import { roleIsAdmin } from "@/lib/auth/is-admin";
import type { AiCoachSettings } from "@/types/ai-coach-module";

export async function updateAiCoachSettingsAction(
  settings: Partial<AiCoachSettings>,
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not authenticated." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  if (!profile || !roleIsAdmin(profile.role)) return { error: "Admin access required." };

  await updateAiCoachSettings(supabase, settings, authData.user.id);
  revalidatePath("/admin/ai-coach");
  return { success: "Settings saved." };
}
