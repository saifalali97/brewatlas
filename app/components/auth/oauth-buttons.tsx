"use client";

import { Apple } from "lucide-react";
import { useState } from "react";
import { buildAuthCallbackUrl } from "@/lib/auth/redirect-url";
import { isAppleOAuthEnabled } from "@/lib/auth/oauth-providers";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { createClient } from "@/lib/supabase/client";

const oauthButtonClass = `${buttons.secondary} h-12 w-full min-w-0 gap-2.5 rounded-xl touch-manipulation [-webkit-tap-highlight-color:transparent]`;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2s4.1 9.2 9.2 9.2c5.3 0 8.8-3.7 8.8-9 0-.6-.1-1.1-.1-1.2z"
      />
    </svg>
  );
}

/**
 * Google / Apple OAuth via the browser Supabase client so the PKCE code
 * verifier is stored in cookies on the device that starts the flow.
 */
export function OAuthButtons() {
  const { t } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<"google" | "apple" | null>(null);
  const showApple = isAppleOAuthEnabled();

  async function signInWithProvider(provider: "google" | "apple") {
    setError(null);
    setPendingProvider(provider);

    try {
      const supabase = createClient();
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: buildAuthCallbackUrl("/account"),
        },
      });

      if (oauthError || !data.url) {
        setError(
          oauthError?.message ??
            (provider === "google"
              ? t("auth.googleSignInUnavailable")
              : t("auth.appleSignInNotConfigured")),
        );
        return;
      }

      window.location.assign(data.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errors.generic"));
    } finally {
      setPendingProvider(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={pendingProvider !== null}
        onClick={() => signInWithProvider("google")}
        className={oauthButtonClass}
      >
        <GoogleIcon />
        {pendingProvider === "google" ? t("auth.signingIn") : t("auth.signInWithGoogle")}
      </button>

      {showApple ? (
        <button
          type="button"
          disabled={pendingProvider !== null}
          onClick={() => signInWithProvider("apple")}
          className={oauthButtonClass}
        >
          <Apple className="h-4 w-4 shrink-0 text-ba-espresso" aria-hidden />
          {pendingProvider === "apple" ? t("auth.signingIn") : t("auth.continueWithApple")}
        </button>
      ) : null}
    </div>
  );
}
