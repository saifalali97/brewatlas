import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  isAuthRelatedPath,
  logSafariAccountComparison,
  logServerAuthDebug,
  summarizeNextRequest,
  summarizeResponseHeaders,
} from "@/lib/debug/server-auth-debug";
import { isSupportedLocale, matchAcceptLanguage } from "@/lib/i18n/config";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";
import { updateSession } from "@/lib/supabase/middleware";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME } from "@/types/i18n";

const AUTH_PATHS = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

function applyRateLimit(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const limit = pathname.startsWith("/api/stripe/webhook")
      ? RATE_LIMITS.stripeWebhook
      : RATE_LIMITS.apiRoute;
    const result = checkRateLimit(ip, limit);
    if (!result.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }
  }

  if (request.method === "POST" && AUTH_PATHS.has(pathname)) {
    const ip = getClientIp(request);
    const result = checkRateLimit(ip, RATE_LIMITS.authPage);
    if (!result.allowed) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }
  }

  return null;
}

/**
 * Runs on (almost) every request. In Next.js 16, this file replaces the
 * old `middleware.ts` convention (renamed to "Proxy") but behaves the
 * same way. See node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 *
 * Also owns locale resolution, in priority order:
 *
 * 1. An explicit `?lang=` query param -- the mechanism localized SEO
 *    metadata uses for hreflang alternates (see
 *    lib/seo/localized-metadata.ts) so search engines have a genuinely
 *    distinct, crawlable URL per locale without a `/[locale]` route
 *    segment. Persisted as the saved preference so it behaves like a
 *    manual switch, not just a one-off render.
 * 2. The saved `brewatlas_locale` cookie, if the visitor has one
 *    already (set here previously, or by `setLocaleAction`).
 * 3. The browser's `Accept-Language` header, on first visit.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  logServerAuthDebug("proxy", "entry", {
    pathname,
    method: request.method,
  });

  if (isAuthRelatedPath(pathname)) {
    logSafariAccountComparison("proxy", "entry", summarizeNextRequest(request));
  }

  const rateLimited = applyRateLimit(request);
  if (rateLimited) {
    logServerAuthDebug("proxy", "exit", { pathname, status: 429, reason: "rate_limited" });
    return rateLimited;
  }

  const response = await updateSession(request);

  const queryLocale = request.nextUrl.searchParams.get("lang");
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  const resolved = isSupportedLocale(queryLocale)
    ? queryLocale
    : isSupportedLocale(cookieLocale)
      ? null // already correct, no cookie write needed
      : matchAcceptLanguage(request.headers.get("accept-language")) ?? DEFAULT_LOCALE;

  if (resolved) {
    response.cookies.set(LOCALE_COOKIE_NAME, resolved, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
    logServerAuthDebug("proxy", "cookie-write", {
      pathname,
      cookie: LOCALE_COOKIE_NAME,
      valueLength: resolved.length,
    });
  }

  logServerAuthDebug("proxy", "exit", {
    pathname,
    status: response.status,
    redirect: response.headers.get("location") ?? null,
    responseHeaders: summarizeResponseHeaders(response),
  });

  if (isAuthRelatedPath(pathname)) {
    logSafariAccountComparison("proxy", "exit", {
      pathname,
      status: response.status,
      redirect: response.headers.get("location") ?? null,
      responseHeaders: summarizeResponseHeaders(response),
      responseCookies: response.cookies.getAll().map(({ name, value }) => ({
        name,
        valueLength: value.length,
      })),
    });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
