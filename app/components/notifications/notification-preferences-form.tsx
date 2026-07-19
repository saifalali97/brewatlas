"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import {
  NOTIFICATION_PREFERENCE_CATEGORIES,
  type NotificationPreferenceCategory,
  type NotificationPreferences,
} from "@/lib/notifications/preferences";
import {
  updateNotificationPreferencesAction,
  type NotificationPreferencesActionState,
} from "@/lib/supabase/notification-preference-actions";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { DictionaryKey } from "@/lib/i18n/types";

type NotificationPreferencesFormProps = {
  initialPreferences: NotificationPreferences;
};

const CATEGORY_LABELS: Record<
  NotificationPreferenceCategory,
  { title: DictionaryKey; description: DictionaryKey }
> = {
  social: {
    title: "notificationPreferencesPage.categorySocialTitle",
    description: "notificationPreferencesPage.categorySocialDescription",
  },
  reviews: {
    title: "notificationPreferencesPage.categoryReviewsTitle",
    description: "notificationPreferencesPage.categoryReviewsDescription",
  },
  content: {
    title: "notificationPreferencesPage.categoryContentTitle",
    description: "notificationPreferencesPage.categoryContentDescription",
  },
  system: {
    title: "notificationPreferencesPage.categorySystemTitle",
    description: "notificationPreferencesPage.categorySystemDescription",
  },
  mentions: {
    title: "notificationPreferencesPage.categoryMentionsTitle",
    description: "notificationPreferencesPage.categoryMentionsDescription",
  },
};

export function NotificationPreferencesForm({ initialPreferences }: NotificationPreferencesFormProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<NotificationPreferencesActionState, FormData>(
    updateNotificationPreferencesAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="currentPath" value="/account/notification-preferences" />

      <div className="overflow-hidden rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl">
        <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] gap-3 border-b border-ba-espresso/08 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ac-espresso">
          <span>{t("notificationPreferencesPage.categoryColumn")}</span>
          <span className="text-center">{t("notificationPreferencesPage.inAppColumn")}</span>
          <span className="text-center">{t("notificationPreferencesPage.emailColumn")}</span>
        </div>

        <ul className="divide-y divide-ba-espresso/[0.06]">
          {NOTIFICATION_PREFERENCE_CATEGORIES.map((category) => {
            const copy = CATEGORY_LABELS[category];
            return (
              <li
                key={category}
                className="grid grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] items-center gap-3 px-5 py-4"
              >
                <div>
                  <p className="text-sm font-medium text-ac-espresso">{t(copy.title)}</p>
                  <p className="mt-1 text-xs text-ac-espresso">{t(copy.description)}</p>
                </div>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    name={`inApp.${category}`}
                    defaultChecked={initialPreferences.inApp[category]}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500/40"
                  />
                  <span className="sr-only">{t("notificationPreferencesPage.inAppColumn")}</span>
                </label>
                <label className="flex justify-center">
                  <input
                    type="checkbox"
                    name={`email.${category}`}
                    defaultChecked={initialPreferences.email[category]}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-500/40"
                  />
                  <span className="sr-only">{t("notificationPreferencesPage.emailColumn")}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs text-ac-espresso">{t("notificationPreferencesPage.emailFutureHint")}</p>

      <FormMessage error={state?.error} success={state?.success} />
      <button type="submit" disabled={pending} className={`${buttons.primary} disabled:opacity-60`}>
        {pending ? t("notificationPreferencesPage.savingCta") : t("notificationPreferencesPage.saveCta")}
      </button>
    </form>
  );
}
