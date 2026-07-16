"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { acSurface, acTypography } from "@/lib/design-system/atlas-canon";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { requestPasswordResetAction, type AuthActionState } from "@/lib/supabase/actions";

export function ForgotPasswordForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    requestPasswordResetAction,
    undefined,
  );

  if (state?.success) {
    return (
      <div className={`${acSurface.plate} p-8 text-center`}>
        <p className={acTypography.h3}>{t("auth.checkInboxTitle")}</p>
        <p className={`${acTypography.body} mt-3`}>{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
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

      <FormMessage error={state?.error} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {pending ? t("auth.sendingLink") : t("auth.sendResetLink")}
      </button>
    </form>
  );
}
