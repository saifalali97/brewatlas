"use client";

import { buildAuthCallbackUrl } from "@/lib/auth/redirect-url";
import { createClient } from "@/lib/supabase/client";

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignUpValidationMessages = {
  enterEmailAndPassword: string;
  passwordTooShort: string;
  passwordsDoNotMatch: string;
};

export type SignUpResult =
  | { ok: true; needsEmailConfirmation: true }
  | { ok: true; needsEmailConfirmation: false; redirectTo: string }
  | { ok: false; error: string };

/** Validates sign-up fields before calling Supabase Auth. */
export function validateSignUpInput(
  input: SignUpInput,
  messages: SignUpValidationMessages,
): string | null {
  if (!input.email || !input.password) {
    return messages.enterEmailAndPassword;
  }
  if (input.password.length < 8) {
    return messages.passwordTooShort;
  }
  if (input.password !== input.confirmPassword) {
    return messages.passwordsDoNotMatch;
  }
  return null;
}

/**
 * Browser-only email sign-up. Uses createBrowserClient so PKCE state is stored
 * in cookies on the initiating device (required for OAuth; email confirm uses
 * token_hash via the callback route when templates are configured correctly).
 */
export async function signUpWithEmail(input: SignUpInput): Promise<SignUpResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: input.fullName ? { full_name: input.fullName } : undefined,
      emailRedirectTo: buildAuthCallbackUrl("/account"),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (data.session) {
    return { ok: true, needsEmailConfirmation: false, redirectTo: "/account" };
  }

  return { ok: true, needsEmailConfirmation: true };
}

export type OAuthProvider = "google" | "apple";

/** Starts an OAuth redirect via the browser Supabase client (PKCE cookies). */
export async function startOAuthSignIn(
  provider: OAuthProvider,
  redirectTo = buildAuthCallbackUrl("/account"),
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error || !data.url) {
    return { ok: false, error: error?.message ?? "OAuth sign-in is unavailable." };
  }

  return { ok: true, url: data.url };
}
