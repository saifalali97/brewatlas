"use client";

import { useState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { PasswordInput } from "@/app/components/auth/password-input";
import { buildAuthCallbackUrl } from "@/lib/auth/redirect-url";
import { acSurface, acTypography } from "@/lib/design-system/atlas-canon";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const { t } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!email || !password) {
      setError(t("auth.enterEmailAndPassword"));
      setPending(false);
      return;
    }
    if (password.length < 8) {
      setError(t("forms.passwordTooShort"));
      setPending(false);
      return;
    }
    if (password !== confirmPassword) {
      setError(t("forms.passwordsDoNotMatch"));
      setPending(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: fullName ? { full_name: fullName } : undefined,
          emailRedirectTo: buildAuthCallbackUrl("/account"),
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setSuccess(t("auth.checkInboxToConfirm"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.generic"));
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className={`${acSurface.plate} p-8 text-center`}>
        <p className={acTypography.h3}>{t("auth.almostThereTitle")}</p>
        <p className={`${acTypography.body} mt-3`}>{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <PasswordInput
        id="password"
        name="password"
        label={t("auth.password")}
        placeholder={t("auth.passwordPlaceholderMin")}
        required
        minLength={8}
        autoComplete="new-password"
      />

      <PasswordInput
        id="confirmPassword"
        name="confirmPassword"
        label={t("forms.confirmPassword")}
        placeholder={t("auth.passwordPlaceholderDots")}
        required
        minLength={8}
        autoComplete="new-password"
      />

      <FormMessage error={error ?? undefined} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70`}>
        {pending ? t("auth.creatingAccount") : t("auth.createAccountCta")}
      </button>
    </form>
  );
}
