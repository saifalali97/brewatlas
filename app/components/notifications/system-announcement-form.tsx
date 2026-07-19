"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import {
  broadcastSystemAnnouncementAction,
  type SystemAnnouncementActionState,
} from "@/lib/supabase/system-announcement-actions";
import { useTranslations } from "@/lib/i18n/translation-context";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-ac-espresso outline-none transition-colors duration-300 placeholder:text-ac-espresso focus:border-amber-500/45";

const labelClass = "text-sm font-medium text-ac-espresso";

export function SystemAnnouncementForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<SystemAnnouncementActionState, FormData>(
    broadcastSystemAnnouncementAction,
    undefined,
  );

  return (
    <form action={formAction} className="mb-10 space-y-5 rounded-[1.5rem] border border-amber-600/20 bg-amber-950/15 p-6">
      <input type="hidden" name="currentPath" value="/admin/notifications" />
      <div>
        <h2 className="text-base font-semibold text-ac-espresso">{t("notificationPreferencesPage.broadcastTitle")}</h2>
        <p className="mt-1 text-sm text-ac-espresso">{t("notificationPreferencesPage.broadcastDescription")}</p>
      </div>

      <label className="block">
        <span className={labelClass}>{t("notificationPreferencesPage.broadcastTitleLabel")}</span>
        <input type="text" name="title" className={inputClass} placeholder={t("notificationPreferencesPage.broadcastTitlePlaceholder")} />
      </label>

      <label className="block">
        <span className={labelClass}>{t("notificationPreferencesPage.broadcastMessageLabel")}</span>
        <textarea
          name="message"
          required
          rows={3}
          className={inputClass}
          placeholder={t("notificationPreferencesPage.broadcastMessagePlaceholder")}
        />
      </label>

      <label className="block">
        <span className={labelClass}>{t("notificationPreferencesPage.broadcastHrefLabel")}</span>
        <input type="text" name="href" className={inputClass} placeholder="/premium" />
      </label>

      <FormMessage error={state?.error} success={state?.success} />
      <button type="submit" disabled={pending} className={`${buttons.primary} disabled:opacity-60`}>
        {pending ? t("notificationPreferencesPage.broadcastSendingCta") : t("notificationPreferencesPage.broadcastSendCta")}
      </button>
    </form>
  );
}
