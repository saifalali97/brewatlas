"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { broadcastSystemAnnouncement } from "@/lib/data/community";
import { roleHasPermission } from "@/lib/auth/permissions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";

export type SystemAnnouncementActionState = { error?: string; success?: string } | undefined;

function readCurrentPath(formData: FormData): string {
  const value = formData.get("currentPath");
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard/notifications";
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function broadcastSystemAnnouncementAction(
  _prev: SystemAnnouncementActionState,
  formData: FormData,
): Promise<SystemAnnouncementActionState> {
  const path = readCurrentPath(formData);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.notificationPreferencesPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).maybeSingle();
  const role = (profile?.role as AppRole | undefined) ?? "user";

  if (!roleHasPermission(role, "cms.notifications")) {
    return { error: labels.broadcastUnauthorized };
  }

  const title = readText(formData, "title");
  const message = readText(formData, "message");
  const href = readText(formData, "href");

  if (!message) {
    return { error: labels.broadcastMessageRequired };
  }

  const delivered = await broadcastSystemAnnouncement(supabase, { title, message, href: href || null });
  if (delivered <= 0) {
    return { error: labels.broadcastFailed };
  }

  revalidatePath(path);
  revalidatePath("/account/notifications");
  revalidatePath("/", "layout");

  return { success: labels.broadcastSuccess.replace("{count}", String(delivered)) };
}
