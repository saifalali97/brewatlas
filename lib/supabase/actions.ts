"use server";

import { redirect } from "next/navigation";
import { buildAuthCallbackUrl } from "@/lib/auth/redirect-url";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { ensureProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";

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

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const dictionary = await getDictionary(await getLocale());

  if (!email || !password) {
    return { error: dictionary.auth.enterEmailAndPassword };
  }
  if (password.length < 8) {
    return { error: dictionary.forms.passwordTooShort };
  }
  if (password !== confirmPassword) {
    return { error: dictionary.forms.passwordsDoNotMatch };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
      emailRedirectTo: buildAuthCallbackUrl("/account"),
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await ensureProfile(supabase, data.user);
  }

  // If email confirmation is disabled for this project, signUp() already
  // returns an active session and the user is signed in immediately.
  if (data.session) {
    redirect("/account");
  }

  return {
    success: dictionary.auth.checkInboxToConfirm,
  };
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

export async function signInWithGoogleAction(): Promise<void> {
  const redirectTo = buildAuthCallbackUrl("/account");
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? dictionary.auth.googleSignInUnavailable)}`,
    );
  }

  redirect(data.url);
}

/**
 * Apple Sign In requires a Services ID, Team ID, Key ID, and private key
 * configured under Authentication > Providers > Apple in the Supabase
 * dashboard. Until that's set up, Supabase responds with an error (e.g.
 * "Unsupported provider") and the user is bounced back to /login with a
 * message - the code path itself is fully wired and ready to go live the
 * moment the provider is configured.
 */
export async function signInWithAppleAction(): Promise<void> {
  const redirectTo = buildAuthCallbackUrl("/account");
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? dictionary.auth.appleSignInNotConfigured)}`,
    );
  }

  redirect(data.url);
}
