"use client";

import {
  passwordPolicyMessage,
  validatePassword,
  type PasswordPolicyMessages,
} from "@/lib/auth/password-policy";
import {
  buildAuthCallbackUrl,
  buildAuthCallbackUrlFromOrigin,
} from "@/lib/auth/redirect-url";
import { createClient } from "@/lib/supabase/client";

export type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignUpValidationMessages = PasswordPolicyMessages & {
  enterEmailAndPassword: string;
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
  const policyFailure = validatePassword(input.password);
  if (policyFailure) {
    return passwordPolicyMessage(policyFailure, messages);
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

/**
 * Starts OAuth via createBrowserClient so the PKCE code verifier is stored in
 * browser cookies before the redirect to the provider. Uses the current origin
 * for the callback URL so local development PKCE exchange matches the initiating host.
 */
export async function startOAuthSignIn(
  provider: OAuthProvider,
  next = "/account",
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const redirectTo = buildAuthCallbackUrlFromOrigin(window.location.origin, next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  if (error || !data.url) {
    return { ok: false, error: error?.message ?? "OAuth sign-in is unavailable." };
  }

  return { ok: true, url: data.url };
}
