"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { PasswordInput } from "@/app/components/auth/password-input";
import { STRONG_PASSWORD_MIN_LENGTH } from "@/lib/auth/password-policy";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { changePasswordAction, type AuthActionState } from "@/lib/supabase/actions";

/** Authenticated change-password form for the signed-in account. */
export function ChangePasswordForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    changePasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      <PasswordInput
        id="currentPassword"
        name="currentPassword"
        label={t("auth.currentPasswordLabel")}
        placeholder={t("auth.passwordPlaceholderDots")}
        required
        autoComplete="current-password"
      />

      <PasswordInput
        id="newPassword"
        name="newPassword"
        label={t("auth.newPasswordLabel")}
        placeholder={t("auth.passwordPlaceholderStrong")}
        required
        minLength={STRONG_PASSWORD_MIN_LENGTH}
        autoComplete="new-password"
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label={t("auth.confirmNewPasswordLabel")}
        placeholder={t("auth.passwordPlaceholderDots")}
        required
        minLength={STRONG_PASSWORD_MIN_LENGTH}
        autoComplete="new-password"
      />

      <p className="text-xs leading-relaxed text-ac-espresso/65">{t("auth.passwordRequirementsHint")}</p>

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {pending ? t("auth.updatingCta") : t("auth.changePasswordCta")}
      </button>
    </form>
  );
}
