"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { signInWithPasswordAction, type AuthActionState } from "@/lib/supabase/actions";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

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
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-stone-300">
            {t("auth.password")}
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-amber-400/90 underline-offset-4 hover:underline"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
          placeholder={t("auth.passwordPlaceholderDots")}
        />
      </div>

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {pending ? t("auth.signingIn") : t("common.continue")}
      </button>
    </form>
  );
}
