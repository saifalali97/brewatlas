import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { recordAdminAudit } from "@/lib/data/admin-audit";

export function readUserIdFromForm(formData: FormData): string | null {
  const value = formData.get("userId");
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function readReasonFromForm(formData: FormData): string | null {
  const value = formData.get("reason");
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

type SuspendProfileInput = {
  supabase: SupabaseClient;
  actorId: string;
  userId: string;
  reason: string;
};

/** Suspends a profile and records audit when the update succeeds. */
export async function suspendProfile({ supabase, actorId, userId, reason }: SuspendProfileInput): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ suspended_at: new Date().toISOString(), suspension_reason: reason })
    .eq("id", userId);

  if (error) return false;

  await recordAdminAudit(supabase, {
    actorId,
    targetType: "user",
    targetId: userId,
    action: "user_suspended",
    metadata: { reason },
  });

  return true;
}

type RestoreProfileInput = {
  supabase: SupabaseClient;
  actorId: string;
  userId: string;
};

/** Clears suspension on a profile and records audit when the update succeeds. */
export async function restoreProfile({ supabase, actorId, userId }: RestoreProfileInput): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ suspended_at: null, suspension_reason: null })
    .eq("id", userId);

  if (error) return false;

  await recordAdminAudit(supabase, {
    actorId,
    targetType: "user",
    targetId: userId,
    action: "user_restored",
  });

  return true;
}
