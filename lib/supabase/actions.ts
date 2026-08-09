"use server";

import { redirect } from "next/navigation";
import { validateStrongPassword } from "@/lib/auth/password-policy";
import { buildAuthCallbackUrl } from "@/lib/auth/redirect-url";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";

export type AuthActionState = { error?: string; success?: string } | undefined;

/** Only ever redirect to a same-site path, never to an attacker-supplied URL. */
function readRedirectTarget(formData: FormData): string {
  const value = formData.get("redirectTo");
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  return "/account";
}

export async function signInWithPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = readRedirectTarget(formData);
  const dictionary = await getDictionary(await getLocale());

  if (!email || !password) {
    return { error: dictionary.auth.enterEmailAndPassword };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureProfile(supabase, data.user);
  }

  redirect(redirectTo);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const dictionary = await getDictionary(await getLocale());

  if (!email) {
    return { error: dictionary.auth.enterEmailAddress };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: buildAuthCallbackUrl("/reset-password"),
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: dictionary.auth.passwordResetLinkSent,
  };
}

export async function updatePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const dictionary = await getDictionary(await getLocale());

  if (password.length < 8) {
    return { error: dictionary.forms.passwordTooShort };
  }
  if (password !== confirmPassword) {
    return { error: dictionary.forms.passwordsDoNotMatch };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}

function strongPasswordErrorMessage(
  failure: NonNullable<ReturnType<typeof validateStrongPassword>>,
  dictionary: Awaited<ReturnType<typeof getDictionary>>,
): string {
  switch (failure) {
    case "too_short":
      return dictionary.auth.passwordTooWeakLength;
    case "missing_upper":
      return dictionary.auth.passwordMissingUpper;
    case "missing_lower":
      return dictionary.auth.passwordMissingLower;
    case "missing_digit":
      return dictionary.auth.passwordMissingDigit;
    case "missing_special":
      return dictionary.auth.passwordMissingSpecial;
    case "same_as_current":
      return dictionary.auth.passwordSameAsCurrent;
  }
}

/**
 * Authenticated password change for the currently signed-in user.
 * Verifies the current password, then updates via Supabase Auth `updateUser()`.
 */
export async function changePasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const dictionary = await getDictionary(await getLocale());

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: dictionary.auth.changePasswordMissingFields };
  }

  if (newPassword !== confirmPassword) {
    return { error: dictionary.forms.passwordsDoNotMatch };
  }

  const policyFailure = validateStrongPassword(newPassword, { currentPassword });
  if (policyFailure) {
    return { error: strongPasswordErrorMessage(policyFailure, dictionary) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?redirectTo=/account/security");
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (reauthError) {
    return { error: dictionary.auth.currentPasswordIncorrect };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return { error: error.message };
  }

  return { success: dictionary.auth.changePasswordSuccess };
}
