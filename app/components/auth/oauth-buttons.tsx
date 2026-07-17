import { Apple } from "lucide-react";
import { isAppleOAuthEnabled } from "@/lib/auth/oauth-providers";
import { buttons } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { signInWithAppleAction, signInWithGoogleAction } from "@/lib/supabase/actions";

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
 * Shared Google / Apple sign-in buttons rendered on both /login and
 * /signup. Server-rendered forms bound directly to Server Actions - no
 * client JavaScript required to kick off the OAuth redirect.
 */
export async function OAuthButtons() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const showApple = isAppleOAuthEnabled();

  return (
    <div className="space-y-3">
      <form action={signInWithGoogleAction}>
        <button type="submit" className={oauthButtonClass}>
          <GoogleIcon />
          {dictionary.auth.signInWithGoogle}
        </button>
      </form>

      {showApple ? (
        <form action={signInWithAppleAction}>
          <button type="submit" className={oauthButtonClass}>
            <Apple className="h-4 w-4 shrink-0 text-ba-espresso" aria-hidden />
            {dictionary.auth.continueWithApple}
          </button>
        </form>
      ) : null}
    </div>
  );
}
