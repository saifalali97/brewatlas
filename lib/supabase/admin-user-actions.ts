"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/is-admin";
import { recordAdminAudit } from "@/lib/data/admin-audit";
import { getOwnerUserById } from "@/lib/data/owner-users";
import {
  readReasonFromForm,
  readUserIdFromForm,
  restoreProfile,
  suspendProfile,
} from "@/lib/supabase/user-moderation-shared";

function revalidateAdminUserPaths() {
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
}

/** Promotes a regular user to admin. */
export async function promoteAdminUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin("/admin/users");
  const userId = readUserIdFromForm(formData);
  if (!userId) {
    revalidateAdminUserPaths();
    return;
  }

  const target = await getOwnerUserById(supabase, userId);
  if (!target || target.role !== "user") {
    revalidateAdminUserPaths();
    return;
  }

  const { error } = await supabase.from("profiles").update({ role: "admin" }).eq("id", userId).eq("role", "user");

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "user",
      targetId: userId,
      action: "user_promoted_admin",
      metadata: { displayName: target.displayName },
    });
  }

  revalidateAdminUserPaths();
}

/** Demotes an admin back to a regular user. Blocks self-demotion. */
export async function demoteAdminUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin("/admin/users");
  const userId = readUserIdFromForm(formData);
  if (!userId || userId === user.id) {
    revalidateAdminUserPaths();
    return;
  }

  const target = await getOwnerUserById(supabase, userId);
  if (!target || target.role !== "admin") {
    revalidateAdminUserPaths();
    return;
  }

  const { error } = await supabase.from("profiles").update({ role: "user" }).eq("id", userId).eq("role", "admin");

  if (!error) {
    await recordAdminAudit(supabase, {
      actorId: user.id,
      targetType: "user",
      targetId: userId,
      action: "user_demoted_admin",
      metadata: { displayName: target.displayName },
    });
  }

  revalidateAdminUserPaths();
}

/** Suspends a user account. */
export async function suspendAdminUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin("/admin/users");
  const userId = readUserIdFromForm(formData);
  if (!userId || userId === user.id) {
    revalidateAdminUserPaths();
    return;
  }

  const reason = readReasonFromForm(formData) ?? "Suspended by administrator.";
  await suspendProfile({ supabase, actorId: user.id, userId, reason });
  revalidateAdminUserPaths();
}

/** Restores a suspended user account. */
export async function restoreAdminUserAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireAdmin("/admin/users");
  const userId = readUserIdFromForm(formData);
  if (!userId) {
    revalidateAdminUserPaths();
    return;
  }

  await restoreProfile({ supabase, actorId: user.id, userId });
  revalidateAdminUserPaths();
}
