"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { updatePasswordAction, type AuthActionState } from "@/lib/supabase/actions";

export function ResetPasswordForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    updatePasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="password" className={forms.label}>
          {t("auth.newPasswordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={forms.input}
          placeholder={t("auth.passwordPlaceholderMin")}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className={forms.label}>
          {t("auth.confirmNewPasswordLabel")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={forms.input}
          placeholder={t("auth.passwordPlaceholderDots")}
        />
      </div>

      <FormMessage error={state?.error} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {pending ? t("auth.updatingCta") : t("auth.updatePasswordCta")}
      </button>
    </form>
  );
}
