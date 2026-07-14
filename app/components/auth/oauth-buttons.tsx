import { Apple } from "lucide-react";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { signInWithGoogleAction, signInWithAppleAction } from "@/lib/supabase/actions";

const oauthButtonClass =
  "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-sm font-medium text-stone-100 transition-all duration-300 ease-out hover:border-amber-500/35 hover:bg-white/[0.06] active:scale-[0.98]";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
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

  return (
    <div className="space-y-3">
      <form action={signInWithGoogleAction}>
        <button type="submit" className={oauthButtonClass}>
          <GoogleIcon />
          {dictionary.auth.signInWithGoogle}
        </button>
      </form>

      <form action={signInWithAppleAction}>
        <button type="submit" className={oauthButtonClass}>
          <Apple className="h-4 w-4" aria-hidden />
          {dictionary.auth.continueWithApple}
        </button>
      </form>
    </div>
  );
}
