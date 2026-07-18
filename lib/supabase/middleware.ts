import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { dashboardToAdminPath } from "@/lib/admin/cms-paths";
import {
  ACCOUNT_PATH_PREFIX,
  canAccessAdminArea,
  isAccountPath,
  isAdminApiPath,
  isAdminPath,
  isOwnerDashboardPath,
} from "@/lib/auth/permission-middleware";
import {
  classifyBrowser,
  isAuthRelatedPath,
  logSafariAccountComparison,
  logServerAuthDebug,
  logServerAuthException,
  summarizeAuthCookies,
  summarizeCookieOptions,
  summarizeCookies,
  summarizeNextRequest,
  summarizeResponseHeaders,
} from "@/lib/debug/server-auth-debug";

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated visitors away from protected routes. Called from the
 * root `proxy.ts` (this Next.js version's equivalent of `middleware.ts`).
 *
 * Session refresh must happen here (rather than only in Server Components)
 * because Server Components cannot write cookies back to the browser -
 * only a Route Handler or Proxy can, per the official Supabase SSR pattern.
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookiesReceived = summarizeCookies(request.cookies.getAll());
  const authCookiesReceived = summarizeAuthCookies(request.cookies.getAll());
  const cookiesWritten: string[] = [];
  const browser = classifyBrowser(request.headers.get("user-agent"));

  logServerAuthDebug("updateSession", "entry", {
    pathname,
    method: request.method,
    cookiesReceived,
  });

  if (isAuthRelatedPath(pathname)) {
    logSafariAccountComparison("updateSession", "entry", summarizeNextRequest(request));
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options);
              cookiesWritten.push(name);
            });
            Object.entries(headers).forEach(([key, value]) =>
              supabaseResponse.headers.set(key, value),
            );
            logServerAuthDebug("updateSession", "cookie-write", {
              pathname,
              browser: browser.family,
              cookiesWritten: summarizeCookieOptions(cookiesToSet),
            });
            if (isAuthRelatedPath(pathname)) {
              logSafariAccountComparison("updateSession", "cookie-write", {
                pathname,
                browser,
                cookiesWritten: summarizeCookieOptions(cookiesToSet),
                supabaseCacheHeaders: headers,
              });
            }
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    logServerAuthDebug("updateSession", "step", {
      pathname,
      browser: browser.family,
      userId: user?.id ?? null,
      authenticated: Boolean(user),
      ...authCookiesReceived,
      authCookiePresentButNoUser: authCookiesReceived.hasAuthCookies && !user,
      userPresentButNoAuthCookie: user && !authCookiesReceived.hasAuthCookies,
    });

    if (isAuthRelatedPath(pathname)) {
      logSafariAccountComparison("updateSession", "step", {
        pathname,
        browser,
        userId: user?.id ?? null,
        authenticated: Boolean(user),
        ...authCookiesReceived,
        authCookiePresentButNoUser: authCookiesReceived.hasAuthCookies && !user,
        userPresentButNoAuthCookie: user && !authCookiesReceived.hasAuthCookies,
      });
    }

    // Legacy owner CMS — permanently redirect to `/admin`.
    if (isOwnerDashboardPath(pathname)) {
      const adminPath = dashboardToAdminPath(pathname);
      const target = new URL(adminPath, request.url).toString();
      logServerAuthDebug("updateSession", "redirect", {
        pathname,
        target,
        userId: user?.id ?? null,
        reason: "legacy_owner_dashboard",
      });
      return NextResponse.redirect(new URL(adminPath, request.url));
    }

    if (isAdminPath(pathname) || isAdminApiPath(pathname)) {
      if (!user) {
        if (isAdminApiPath(pathname)) {
          logServerAuthDebug("updateSession", "exit", {
            pathname,
            status: 401,
            cookiesWritten,
          });
          return NextResponse.json({ error: "Authentication required." }, { status: 401 });
        }

        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirectTo", pathname);
        logServerAuthDebug("updateSession", "redirect", {
          pathname,
          target: redirectUrl.toString(),
          userId: null,
          reason: "admin_unauthenticated",
        });
        return NextResponse.redirect(redirectUrl);
      }

      const allowed = await canAccessAdminArea(supabase, user.id);
      if (!allowed) {
        if (isAdminApiPath(pathname)) {
          logServerAuthDebug("updateSession", "exit", {
            pathname,
            status: 403,
            userId: user.id,
            cookiesWritten,
          });
          return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        const target = new URL("/", request.url).toString();
        logServerAuthDebug("updateSession", "redirect", {
          pathname,
          target,
          userId: user.id,
          reason: "admin_forbidden",
        });
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    if (isAccountPath(pathname) && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("suspended_at")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.suspended_at) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("error", encodeURIComponent("Your account has been suspended."));
        logServerAuthDebug("updateSession", "redirect", {
          pathname,
          target: redirectUrl.toString(),
          userId: user.id,
          reason: "account_suspended",
        });
        return NextResponse.redirect(redirectUrl);
      }
    }

    if (isAccountPath(pathname) && !user) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      logServerAuthDebug("updateSession", "redirect", {
        pathname,
        target: redirectUrl.toString(),
        userId: null,
        reason: "account_unauthenticated",
      });
      return NextResponse.redirect(redirectUrl);
    }

    logServerAuthDebug("updateSession", "exit", {
      pathname,
      browser: browser.family,
      userId: user?.id ?? null,
      cookiesWritten,
      responseCookies: summarizeCookies(supabaseResponse.cookies.getAll()),
      responseHeaders: summarizeResponseHeaders(supabaseResponse),
    });

    if (isAuthRelatedPath(pathname)) {
      logSafariAccountComparison("updateSession", "exit", {
        pathname,
        browser,
        userId: user?.id ?? null,
        cookiesWritten,
        responseCookies: summarizeCookies(supabaseResponse.cookies.getAll()),
        responseHeaders: summarizeResponseHeaders(supabaseResponse),
        outcome: user ? "allow" : isAccountPath(pathname) ? "would_redirect_login" : "continue",
      });
    }

    return supabaseResponse;
  } catch (error) {
    logServerAuthException("updateSession", error, { pathname, cookiesReceived, cookiesWritten });
    throw error;
  }
}

export { ACCOUNT_PATH_PREFIX };
