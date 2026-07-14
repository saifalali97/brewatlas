"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { signUpAction, type AuthActionState } from "@/lib/supabase/actions";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

export function SignupForm() {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signUpAction,
    undefined,
  );

  if (state?.success) {
    return (
      <div className="rounded-[1.5rem] border border-amber-500/25 bg-amber-950/20 p-8 text-center">
        <p className="text-lg font-medium text-stone-50">{t("auth.almostThereTitle")}</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-400">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium text-stone-300">
          {t("auth.fullName")}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          className={inputClass}
          placeholder={t("auth.namePlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium text-stone-300">
          {t("auth.email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          placeholder={t("auth.emailPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-medium text-stone-300">
          {t("auth.password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
          placeholder={t("auth.passwordPlaceholderMin")}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-300">
          {t("forms.confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={inputClass}
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
