"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/auth/permission-middleware";
import { requireOwner } from "@/lib/auth/require-owner";
import { recordAdminAudit } from "@/lib/data/admin-audit";
import { getOwnerUserById } from "@/lib/data/owner-users";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

function readUserId(formData: FormData): string | null {
  const value = formData.get("userId");
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readReason(formData: FormData): string | null {
  const value = formData.get("reason");
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

async function requireUsersPermission() {
  const session = await requireOwner("/dashboard/users");
  const allowed = await userHasPermission(session.supabase, session.user.id, "cms.users");
  if (!allowed) {
    redirect("/dashboard");
  }
  return session;
}

function revalidateOwnerUserPaths() {
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/analytics");
}

/** Suspends a user account and records an audit log entry. */
export async function suspendOwnerUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUsersPermission();
  const userId = readUserId(formData);
  if (!userId || userId === user.id) {
    revalidateOwnerUserPaths();
    return;
  }

  const reason = readReason(formData) ?? "Suspended by moderator.";

  const { error } = await supabase
    .from("profiles")
    .update({ suspended_at: new Date().toISOString(), suspension_reason: reason })
    .eq("id", userId);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "user",
      targetId: userId,
      action: "user_suspended",
      metadata: { reason },
    });
  }

  revalidateOwnerUserPaths();
}

/** Restores a suspended user account. */
export async function restoreOwnerUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUsersPermission();
  const userId = readUserId(formData);
  if (!userId) {
    revalidateOwnerUserPaths();
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ suspended_at: null, suspension_reason: null })
    .eq("id", userId);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "user",
      targetId: userId,
      action: "user_restored",
    });
  }

  revalidateOwnerUserPaths();
}

/** Permanently deletes a user via the Supabase Admin API. */
export async function deleteOwnerUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUsersPermission();
  const userId = readUserId(formData);
  if (!userId || userId === user.id) {
    revalidateOwnerUserPaths();
    return;
  }

  const target = await getOwnerUserById(supabase, userId);
  if (!target) {
    revalidateOwnerUserPaths();
    return;
  }

  if (!hasAdminClient()) {
    console.error("deleteOwnerUserAction: SUPABASE_SERVICE_ROLE_KEY is required.");
    revalidateOwnerUserPaths();
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "user",
      targetId: userId,
      action: "user_deleted",
      metadata: { displayName: target.displayName },
    });
  } else {
    console.error("deleteOwnerUserAction failed", error);
  }

  revalidateOwnerUserPaths();
}
