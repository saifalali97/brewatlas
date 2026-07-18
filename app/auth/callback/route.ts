import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/seo/site";
import { ensureProfile } from "@/lib/supabase/profile";

/**
 * Completes Supabase auth redirects:
 *
 * - Email confirm / password reset: `token_hash` + `type` → verifyOtp()
 *   (official SSR pattern — no PKCE verifier cookie required).
 * - OAuth: `code` → exchangeCodeForSession() (PKCE verifier must be in cookies
 *   from the browser that started the flow via createBrowserClient).
 *
 * Session cookies must be written onto the redirect NextResponse itself.
 */
function resolveRedirectBase(request: NextRequest): string {
  return process.env.NODE_ENV === "production"
    ? getSiteUrl()
    : request.nextUrl.origin.replace(/\/$/, "");
}

function resolveSafeNext(raw: string | null): string {
  const next = raw ?? "/account";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

function loginErrorRedirect(redirectBase: string, message: string, cause?: unknown) {
  console.error("[auth/callback]", message, cause ?? "");
  return NextResponse.redirect(
    `${redirectBase}/login?error=${encodeURIComponent(message)}`,
  );
}

function createSupabaseForCallback(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

async function completeSession(
  supabase: ReturnType<typeof createSupabaseForCallback>,
  redirectBase: string,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return loginErrorRedirect(
      redirectBase,
      "Authentication did not establish a session.",
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await ensureProfile(supabase, user);
    } catch (profileError) {
      console.error("[auth/callback] ensureProfile threw", profileError);
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const redirectBase = resolveRedirectBase(request);
  const safeNext = resolveSafeNext(request.nextUrl.searchParams.get("next"));

  const authError = request.nextUrl.searchParams.get("error");
  const authErrorDescription = request.nextUrl.searchParams.get("error_description");
  if (authError) {
    return loginErrorRedirect(
      redirectBase,
      authErrorDescription ?? authError,
      { authError, authErrorDescription },
    );
  }

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  const code = request.nextUrl.searchParams.get("code");

  if (!tokenHash && !code) {
    return loginErrorRedirect(redirectBase, "Missing or invalid confirmation code.");
  }

  const successRedirect = `${redirectBase}${safeNext}`;
  const response = NextResponse.redirect(successRedirect);

  try {
    const supabase = createSupabaseForCallback(request, response);

    // Email confirm / password reset — verifyOtp (SSR-safe, no PKCE verifier).
    if (tokenHash && otpType) {
      let verifyResult;
      try {
        verifyResult = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType as EmailOtpType,
        });
      } catch (verifyThrown) {
        return loginErrorRedirect(
          redirectBase,
          verifyThrown instanceof Error ? verifyThrown.message : "Email confirmation failed.",
          verifyThrown,
        );
      }

      const { error } = verifyResult;

      if (error) {
        return loginErrorRedirect(redirectBase, error.message, error);
      }

      const sessionError = await completeSession(supabase, redirectBase);
      if (sessionError) {
        return sessionError;
      }

      return response;
    }

    // OAuth — PKCE code exchange (verifier must exist in request cookies).
    if (code) {
      let exchangeResult;
      try {
        exchangeResult = await supabase.auth.exchangeCodeForSession(code);
      } catch (exchangeThrown) {
        return loginErrorRedirect(
          redirectBase,
          exchangeThrown instanceof Error
            ? exchangeThrown.message
            : "Email confirmation failed.",
          exchangeThrown,
        );
      }

      const { error } = exchangeResult;

      if (error) {
        return loginErrorRedirect(redirectBase, error.message, error);
      }

      const sessionError = await completeSession(supabase, redirectBase);
      if (sessionError) {
        return sessionError;
      }

      return response;
    }

    return loginErrorRedirect(redirectBase, "Missing confirmation type.");
  } catch (unexpected) {
    return loginErrorRedirect(
      redirectBase,
      unexpected instanceof Error ? unexpected.message : "Email confirmation failed.",
      unexpected,
    );
  }
}
