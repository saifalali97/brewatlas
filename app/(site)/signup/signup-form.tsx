"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { acSurface, acTypography } from "@/lib/design-system/atlas-canon";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { signUpAction, type AuthActionState } from "@/lib/supabase/actions";

export function SignupForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signUpAction,
    undefined,
  );

  if (state?.success) {
    return (
      <div className={`${acSurface.plate} p-8 text-center`}>
        <p className={acTypography.h3}>{t("auth.almostThereTitle")}</p>
        <p className={`${acTypography.body} mt-3`}>{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="fullName" className={forms.label}>
          {t("auth.fullName")}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          className={forms.input}
          placeholder={t("auth.namePlaceholder")}
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
        <label htmlFor="password" className={forms.label}>
          {t("auth.password")}
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
          {t("forms.confirmPassword")}
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
        {pending ? t("auth.creatingAccount") : t("auth.createAccountCta")}
      </button>
    </form>
  );
}
