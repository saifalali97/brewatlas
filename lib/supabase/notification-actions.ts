"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for the private notification inbox (`user_notifications`).
 * Notifications themselves are only ever created via the
 * `create_notification` SQL RPC (see `lib/data/community.ts`); these
 * actions only cover the recipient managing their own inbox.
 */

function readCurrentPath(formData: FormData): string {
  const value = formData.get("currentPath");
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard/notifications";
}

/** Marks a single notification the caller owns as read. */
export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const notificationId = formData.get("notificationId");
  if (typeof notificationId !== "string" || notificationId.length === 0) {
    revalidatePath(path);
    revalidatePath("/", "layout");
    return;
  }

  await supabase
    .from("user_notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", authData.user.id);

  revalidatePath(path);
  revalidatePath("/", "layout");
}

/** Marks every notification the caller owns as read. */
export async function markAllNotificationsReadAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  await supabase
    .from("user_notifications")
    .update({ is_read: true })
    .eq("user_id", authData.user.id)
    .eq("is_read", false);

  revalidatePath(path);
  revalidatePath("/", "layout");
}

/** Deletes a single notification the caller owns. */
export async function deleteNotificationAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const notificationId = formData.get("notificationId");
  if (typeof notificationId !== "string" || notificationId.length === 0) {
    revalidatePath(path);
    revalidatePath("/", "layout");
    return;
  }

  await supabase.from("user_notifications").delete().eq("id", notificationId).eq("user_id", authData.user.id);

  revalidatePath(path);
  revalidatePath("/", "layout");
}
