import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  logSafariAccountComparison,
  logServerAuthDebug,
  logServerAuthException,
  summarizeCookieOptions,
  summarizeCookies,
  summarizeNextRequest,
  summarizeResponseHeaders,
} from "@/lib/debug/server-auth-debug";
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
  logServerAuthException("auth/callback", cause ?? new Error(message), {
    phase: "loginErrorRedirect",
    redirectTarget: `${redirectBase}/login?error=…`,
    message,
  });
  return NextResponse.redirect(
    `${redirectBase}/login?error=${encodeURIComponent(message)}`,
  );
}

function createSupabaseForCallback(
  request: NextRequest,
  response: NextResponse,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch (cookieError) {
              logServerAuthException("auth/callback", cookieError, {
                phase: "cookieStore.set",
                cookieName: name,
              });
            }
            response.cookies.set(name, value, options);
          });
          logServerAuthDebug("auth/callback", "cookie-write", {
            cookiesWritten: summarizeCookieOptions(cookiesToSet),
          });
          logSafariAccountComparison("auth/callback", "cookie-write", {
            cookiesWritten: summarizeCookieOptions(cookiesToSet),
            supabaseCacheHeaders: headers,
            note: "Post-login Set-Cookie — verify SameSite/Secure for Safari",
          });
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => {
              response.headers.set(key, value);
            });
          }
        },
      },
    },
  );
}

async function finalizeAuthenticatedRedirect(
  supabase: ReturnType<typeof createSupabaseForCallback>,
  response: NextResponse,
  session: Session | null,
  user: User | null,
  redirectBase: string,
  successRedirect: string,
) {
  logServerAuthDebug("auth/callback", "step", {
    step: "finalizeAuthenticatedRedirect",
    userId: user?.id ?? null,
    hasSession: Boolean(session?.access_token),
    redirectTarget: successRedirect,
  });

  if (!session?.access_token) {
    return loginErrorRedirect(
      redirectBase,
      "Authentication did not establish a session.",
    );
  }

  if (user) {
    try {
      await ensureProfile(supabase, user);
    } catch (profileError) {
      logServerAuthException("auth/callback", profileError, {
        phase: "ensureProfile",
        userId: user.id,
        redirectTarget: successRedirect,
      });
    }
  }

  logServerAuthDebug("auth/callback", "redirect", {
    target: successRedirect,
    userId: user?.id ?? null,
    responseCookies: summarizeCookies(response.cookies.getAll()),
    responseHeaders: summarizeResponseHeaders(response),
  });
  logSafariAccountComparison("auth/callback", "redirect", {
    target: successRedirect,
    userId: user?.id ?? null,
    responseCookies: summarizeCookieOptions(
      response.cookies.getAll().map(({ name, value }) => ({ name, value, options: {} })),
    ),
    responseHeaders: summarizeResponseHeaders(response),
  });

  return response;
}

export async function GET(request: NextRequest) {
  const redirectBase = resolveRedirectBase(request);
  const safeNext = resolveSafeNext(request.nextUrl.searchParams.get("next"));
  const successRedirect = `${redirectBase}${safeNext}`;

  logServerAuthDebug("auth/callback", "entry", {
    pathname: request.nextUrl.pathname,
    safeNext,
    cookiesReceived: summarizeCookies(request.cookies.getAll()),
    hasTokenHash: Boolean(request.nextUrl.searchParams.get("token_hash")),
    hasCode: Boolean(request.nextUrl.searchParams.get("code")),
  });
  logSafariAccountComparison("auth/callback", "entry", summarizeNextRequest(request));

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

  const response = NextResponse.redirect(successRedirect);
  const cookieStore = await cookies();

  try {
    const supabase = createSupabaseForCallback(request, response, cookieStore);

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

      const { data, error } = verifyResult;

      if (error) {
        return loginErrorRedirect(redirectBase, error.message, error);
      }

      logServerAuthDebug("auth/callback", "step", {
        step: "verifyOtp success",
        userId: data.user?.id ?? null,
      });

      return finalizeAuthenticatedRedirect(
        supabase,
        response,
        data.session,
        data.user,
        redirectBase,
        successRedirect,
      );
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

      const { data, error } = exchangeResult;

      if (error) {
        return loginErrorRedirect(redirectBase, error.message, error);
      }

      logServerAuthDebug("auth/callback", "step", {
        step: "exchangeCodeForSession success",
        userId: data.user?.id ?? null,
      });

      return finalizeAuthenticatedRedirect(
        supabase,
        response,
        data.session,
        data.user,
        redirectBase,
        successRedirect,
      );
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
