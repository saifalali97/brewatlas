"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getNotificationPreferences, upsertNotificationPreferences } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import {
  NOTIFICATION_PREFERENCE_CATEGORIES,
  parseNotificationPreferences,
  type NotificationChannelPreferences,
  type NotificationPreferenceCategory,
} from "@/lib/notifications/preferences";
import { createClient } from "@/lib/supabase/server";

export type NotificationPreferencesActionState = { error?: string; success?: string } | undefined;

function readCurrentPath(formData: FormData): string {
  const value = formData.get("currentPath");
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account/notification-preferences";
}

function readChannelPreferences(
  formData: FormData,
  prefix: "inApp" | "email",
): NotificationChannelPreferences {
  const result = {} as NotificationChannelPreferences;

  for (const category of NOTIFICATION_PREFERENCE_CATEGORIES) {
    result[category] = formData.get(`${prefix}.${category}`) === "on";
  }

  return result;
}

export async function updateNotificationPreferencesAction(
  _prev: NotificationPreferencesActionState,
  formData: FormData,
): Promise<NotificationPreferencesActionState> {
  const path = readCurrentPath(formData);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const current = await getNotificationPreferences(supabase, authData.user.id);
  const preferences = parseNotificationPreferences({
    in_app: readChannelPreferences(formData, "inApp"),
    email: readChannelPreferences(formData, "email"),
  });

  // Preserve categories not submitted (defensive).
  for (const category of NOTIFICATION_PREFERENCE_CATEGORIES) {
    if (!formData.has(`inApp.${category}`)) {
      preferences.inApp[category as NotificationPreferenceCategory] = current.inApp[category];
    }
    if (!formData.has(`email.${category}`)) {
      preferences.email[category as NotificationPreferenceCategory] = current.email[category];
    }
  }

  await upsertNotificationPreferences(supabase, authData.user.id, preferences);

  revalidatePath(path);
  revalidatePath("/account/notifications");
  revalidatePath("/", "layout");

  return { success: dictionary.notificationPreferencesPage.savedSuccess };
}
