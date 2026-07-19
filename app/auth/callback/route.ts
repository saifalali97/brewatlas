import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType, Session, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/seo/site";
import { ensureProfile } from "@/lib/supabase/profile";

/**
 * Completes Supabase auth redirects:
 *
 * - Email confirm / password reset: `token_hash` + `type` → verifyOtp()
 *   (official SSR pattern — no PKCE verifier cookie required).
 * - OAuth: `code` → exchangeCodeForSession() (PKCE verifier must be in request cookies
 *   from the browser that started the flow via createBrowserClient)
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

function loginErrorRedirect(redirectBase: string, message: string) {
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
            } catch {
              // Route handlers allow cookie writes; ignore if unavailable.
            }
            response.cookies.set(name, value, options);
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
) {
  if (!session?.access_token) {
    return loginErrorRedirect(
      redirectBase,
      "Authentication did not establish a session.",
    );
  }

  if (user) {
    try {
      await ensureProfile(supabase, user);
    } catch {
      // Profile provisioning is best-effort; session cookies are already on the response.
    }
  }

  return response;
}

export async function GET(request: NextRequest) {
  const redirectBase = resolveRedirectBase(request);
  const safeNext = resolveSafeNext(request.nextUrl.searchParams.get("next"));
  const successRedirect = `${redirectBase}${safeNext}`;

  const authError = request.nextUrl.searchParams.get("error");
  const authErrorDescription = request.nextUrl.searchParams.get("error_description");
  if (authError) {
    return loginErrorRedirect(redirectBase, authErrorDescription ?? authError);
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
        );
      }

      const { data, error } = verifyResult;

      if (error) {
        return loginErrorRedirect(redirectBase, error.message);
      }

      return finalizeAuthenticatedRedirect(
        supabase,
        response,
        data.session,
        data.user,
        redirectBase,
      );
    }

    if (code) {
      let exchangeResult;
      try {
        exchangeResult = await supabase.auth.exchangeCodeForSession(code);
      } catch (exchangeThrown) {
        return loginErrorRedirect(
          redirectBase,
          exchangeThrown instanceof Error
            ? exchangeThrown.message
            : "Authentication failed.",
        );
      }

      const { data, error } = exchangeResult;

      if (error) {
        return loginErrorRedirect(redirectBase, error.message);
      }

      return finalizeAuthenticatedRedirect(
        supabase,
        response,
        data.session,
        data.user,
        redirectBase,
      );
    }

    return loginErrorRedirect(redirectBase, "Missing confirmation type.");
  } catch (unexpected) {
    return loginErrorRedirect(
      redirectBase,
      unexpected instanceof Error ? unexpected.message : "Authentication failed.",
    );
  }
}
