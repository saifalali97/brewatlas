"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/auth/permission-middleware";
import { requireAdmin } from "@/lib/auth/is-admin";
import { recordAdminAudit } from "@/lib/data/admin-audit";
import { getOwnerUserById } from "@/lib/data/owner-users";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import {
  readReasonFromForm,
  readUserIdFromForm,
  restoreProfile,
  suspendProfile,
} from "@/lib/supabase/user-moderation-shared";

async function requireUsersPermission() {
  const session = await requireAdmin("/admin/users");
  const allowed = await userHasPermission(session.supabase, session.user.id, "cms.users");
  if (!allowed) {
    redirect("/admin");
  }
  return session;
}

function revalidateOwnerUserPaths() {
  revalidatePath("/admin/users");
  revalidatePath("/admin/analytics");
}

/** Suspends a user account and records an audit log entry. */
export async function suspendOwnerUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUsersPermission();
  const userId = readUserIdFromForm(formData);
  if (!userId || userId === user.id) {
    revalidateOwnerUserPaths();
    return;
  }

  const reason = readReasonFromForm(formData) ?? "Suspended by moderator.";
  await suspendProfile({ supabase, actorId: user.id, userId, reason });
  revalidateOwnerUserPaths();
}

/** Restores a suspended user account. */
export async function restoreOwnerUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUsersPermission();
  const userId = readUserIdFromForm(formData);
  if (!userId) {
    revalidateOwnerUserPaths();
    return;
  }

  await restoreProfile({ supabase, actorId: user.id, userId });
  revalidateOwnerUserPaths();
}

/** Permanently deletes a user via the Supabase Admin API. */
export async function deleteOwnerUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUsersPermission();
  const userId = readUserIdFromForm(formData);
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
