"use client";

import { buildAuthCallbackUrlFromOrigin } from "@/lib/auth/redirect-url";
import { createClient } from "@/lib/supabase/client";

export type OAuthProvider = "google" | "apple";

/**
 * Starts OAuth via createBrowserClient so the PKCE code verifier is stored in
 * browser cookies before the redirect to the provider. Server Actions cannot
 * reliably persist the verifier for the callback exchange.
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
