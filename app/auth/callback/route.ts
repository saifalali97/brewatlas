import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/seo/site";
import { ensureProfile } from "@/lib/supabase/profile";

/**
 * Exchanges the PKCE `code` param Supabase appends to email confirmation,
 * password reset, and OAuth redirect links for a real session, then
 * forwards the user to `next` (defaults to /account). Required by the
 * official Supabase SSR pattern - Server Components can't set cookies, so
 * the session cookie exchange has to happen in a Route Handler like this.
 *
 * Session cookies must be written onto the redirect `NextResponse` itself.
 * Using `cookies().set()` via the shared server client can fail silently
 * in Route Handlers, leaving auth succeeded server-side but no session in
 * the browser on the next navigation.
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

  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");

  if (!code && !tokenHash) {
    return loginErrorRedirect(redirectBase, "Missing or invalid confirmation code.");
  }

  const successRedirect = `${redirectBase}${safeNext}`;
  const response = NextResponse.redirect(successRedirect);

  try {
    const supabase = createSupabaseForCallback(request, response);

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

      const { data, error } = exchangeResult;

      if (error) {
        return loginErrorRedirect(redirectBase, error.message, error);
      }

      if (!data?.session) {
        return loginErrorRedirect(
          redirectBase,
          "Email confirmation did not establish a session.",
          { hasUser: Boolean(data?.user) },
        );
      }

      if (data.user) {
        try {
          await ensureProfile(supabase, data.user);
        } catch (profileError) {
          console.error("[auth/callback] ensureProfile threw", profileError);
        }
      }

      return response;
    }

    if (!otpType) {
      return loginErrorRedirect(redirectBase, "Missing confirmation type.");
    }

    let verifyResult;
    try {
      verifyResult = await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: otpType as EmailOtpType,
      });
    } catch (verifyThrown) {
      return loginErrorRedirect(
        redirectBase,
        verifyThrown instanceof Error ? verifyThrown.message : "Email confirmation failed.",
        verifyThrown,
      );
    }

    const { data, error } = verifyResult;

    if (error) {
      return loginErrorRedirect(redirectBase, error.message, error);
    }

    if (!data?.session) {
      return loginErrorRedirect(
        redirectBase,
        "Email confirmation did not establish a session.",
        { hasUser: Boolean(data?.user) },
      );
    }

    if (data.user) {
      try {
        await ensureProfile(supabase, data.user);
      } catch (profileError) {
        console.error("[auth/callback] ensureProfile threw", profileError);
      }
    }

    return response;
  } catch (unexpected) {
    return loginErrorRedirect(
      redirectBase,
      unexpected instanceof Error ? unexpected.message : "Email confirmation failed.",
      unexpected,
    );
  }
}
