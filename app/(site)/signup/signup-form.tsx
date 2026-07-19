"use client";

import { useState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { PasswordInput } from "@/app/components/auth/password-input";
import { acSurface, acTypography } from "@/lib/design-system/atlas-canon";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { signUpWithEmail, validateSignUpInput } from "@/lib/supabase/browser-auth";

type SignupFormStatus = "idle" | "submitting" | "success";

export function SignupForm() {
  const { t } = useTranslations();
  const [status, setStatus] = useState<SignupFormStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const input = {
      fullName: String(formData.get("fullName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    };

    const validationError = validateSignUpInput(input, {
      enterEmailAndPassword: t("auth.enterEmailAndPassword"),
      passwordTooShort: t("forms.passwordTooShort"),
      passwordsDoNotMatch: t("forms.passwordsDoNotMatch"),
    });

    if (validationError) {
      setError(validationError);
      setSuccessMessage(null);
      return;
    }

    setStatus("submitting");
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await signUpWithEmail(input);

      if (!result.ok) {
        setStatus("idle");
        setError(result.error);
        return;
      }

      if (!result.needsEmailConfirmation) {
        window.location.assign(result.redirectTo);
        return;
      }

      setStatus("success");
      setSuccessMessage(t("auth.checkInboxToConfirm"));
    } catch (caught) {
      setStatus("idle");
      setError(caught instanceof Error ? caught.message : t("errors.generic"));
    }
  }

  if (status === "success" && successMessage) {
    return (
      <div className={`${acSurface.plate} p-8 text-center`}>
        <p className={acTypography.h3}>{t("auth.almostThereTitle")}</p>
        <p className={`${acTypography.body} mt-3`}>{successMessage}</p>
      </div>
    );
  }

  const isSubmitting = status === "submitting";

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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${buttons.primary} w-full disabled:opacity-70`}
      >
        {isSubmitting ? t("auth.creatingAccount") : t("auth.createAccountCta")}
      </button>
    </form>
  );
}
