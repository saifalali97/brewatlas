"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { PasswordInput } from "@/app/components/auth/password-input";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { signInWithPasswordAction, type AuthActionState } from "@/lib/supabase/actions";

type LoginFormProps = {
  redirectTo?: string;
  initialError?: string;
};

export function LoginForm({ redirectTo, initialError }: LoginFormProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signInWithPasswordAction,
    initialError ? { error: initialError } : undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="redirectTo" value={redirectTo ?? "/account"} />

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

      <PasswordInput
        id="password"
        name="password"
        label={t("auth.password")}
        placeholder={t("auth.passwordPlaceholderDots")}
        required
        autoComplete="current-password"
        labelAside={
          <Link
            href="/forgot-password"
            className={`${acTypography.nav} text-xs text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}
          >
            {t("auth.forgotPassword")}
          </Link>
        }
      />

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {pending ? t("auth.signingIn") : t("common.continue")}
      </button>
    </form>
  );
}
