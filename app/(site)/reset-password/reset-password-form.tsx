"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { PasswordInput } from "@/app/components/auth/password-input";
import { buttons } from "@/lib/constants/styles";
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
      <PasswordInput
        id="password"
        name="password"
        label={t("auth.newPasswordLabel")}
        placeholder={t("auth.passwordPlaceholderMin")}
        required
        minLength={8}
        autoComplete="new-password"
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label={t("auth.confirmNewPasswordLabel")}
        placeholder={t("auth.passwordPlaceholderDots")}
        required
        minLength={8}
        autoComplete="new-password"
      />

      <FormMessage error={state?.error} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {pending ? t("auth.updatingCta") : t("auth.updatePasswordCta")}
      </button>
    </form>
  );
}
