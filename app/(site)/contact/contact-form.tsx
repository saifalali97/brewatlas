"use client";

import { useActionState } from "react";
import { acSurface, acTypography } from "@/lib/design-system/atlas-canon";
import { buttons, forms } from "@/lib/constants/styles";
import { submitContactFormAction } from "@/lib/supabase/contact-actions";
import { useTranslations } from "@/lib/i18n/translation-context";

export function ContactForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState(submitContactFormAction, undefined);

  if (state?.success) {
    return (
      <div className={`${acSurface.plate} p-8 text-center`}>
        <p className={acTypography.h3}>{t("contactPage.messageSentTitle")}</p>
        <p className={`${acTypography.body} mt-3`}>{t("contactPage.messageSentBody")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state?.error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {t("contactPage.messageSendFailed")}
        </p>
      ) : null}

      <div>
        <label htmlFor="name" className={forms.label}>
          {t("contactPage.nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          maxLength={120}
          className={forms.input}
          placeholder={t("contactPage.namePlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="email" className={forms.label}>
          {t("auth.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={forms.input}
          placeholder={t("auth.emailPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="message" className={forms.label}>
          {t("contactPage.messageLabel")}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={4000}
          className={forms.input}
          placeholder={t("contactPage.messagePlaceholder")}
        />
      </div>

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-60`}>
        {pending ? t("contactPage.sendingMessage") : t("contactPage.sendMessageCta")}
      </button>
    </form>
  );
}
