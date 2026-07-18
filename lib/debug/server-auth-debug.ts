/**
 * TEMPORARY — server-side auth / Safari-vs-Chrome comparison instrumentation.
 * Remove after identifying why Safari reaches app/error.tsx while Chrome reaches /account.
 */

import type { NextRequest, NextResponse } from "next/server";

type ServerAuthPhase =
  | "entry"
  | "exit"
  | "redirect"
  | "cookie-read"
  | "cookie-write"
  | "step"
  | "safari-compare";

export type CookieSummary = {
  name: string;
  valueLength: number;
};

export type CookieOptionSummary = {
  name: string;
  valueLength: number;
  sameSite?: string;
  secure?: boolean;
  httpOnly?: boolean;
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: string;
  isAuthCookie: boolean;
};

export type BrowserSummary = {
  userAgent: string | null;
  family: "safari" | "chrome" | "firefox" | "edge" | "other" | "unknown";
  isSafari: boolean;
  isChrome: boolean;
  /** True for Chrome, Edge, Opera, etc. — not Safari. */
  isChromium: boolean;
};

const AUTH_COOKIE_PREFIXES = ["sb-", "supabase-auth-token"];

export function isAuthRelatedPath(pathname: string): boolean {
  return (
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/login" ||
    pathname.startsWith("/auth/") ||
    pathname === "/signup"
  );
}

export function classifyBrowser(userAgent: string | null): BrowserSummary {
  const ua = userAgent ?? "";

  // Safari (including iOS) — exclude Chromium-based browsers that also contain "Safari".
  const isChromium = /Chrome|Chromium|Edg|OPR|CriOS|FxiOS/.test(ua);
  const isSafari = /Safari/.test(ua) && !isChromium;
  const isChrome = /Chrome|Chromium|CriOS/.test(ua) && !/Edg|OPR/.test(ua);
  const isFirefox = /Firefox|FxiOS/.test(ua);
  const isEdge = /Edg/.test(ua);

  let family: BrowserSummary["family"] = "unknown";
  if (isSafari) family = "safari";
  else if (isEdge) family = "edge";
  else if (isChrome) family = "chrome";
  else if (isFirefox) family = "firefox";
  else if (ua) family = "other";

  return {
    userAgent: userAgent || null,
    family,
    isSafari,
    isChrome,
    isChromium,
  };
}

export function isAuthCookieName(name: string): boolean {
  return AUTH_COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix));
}

export function summarizeCookies(
  cookies: ReadonlyArray<{ name: string; value?: string }>,
): CookieSummary[] {
  return cookies.map(({ name, value }) => ({
    name,
    valueLength: value?.length ?? 0,
  }));
}

export function summarizeCookieOptions(
  cookies: ReadonlyArray<{
    name: string;
    value: string;
    options?: {
      sameSite?: "lax" | "strict" | "none" | boolean;
      secure?: boolean;
      httpOnly?: boolean;
      path?: string;
      domain?: string;
      maxAge?: number;
      expires?: Date;
    };
  }>,
): CookieOptionSummary[] {
  return cookies.map(({ name, value, options }) => ({
    name,
    valueLength: value.length,
    sameSite:
      options?.sameSite === true
        ? "true"
        : options?.sameSite === false
          ? "false"
          : options?.sameSite,
    secure: options?.secure,
    httpOnly: options?.httpOnly,
    path: options?.path,
    domain: options?.domain,
    maxAge: options?.maxAge,
    expires: options?.expires?.toISOString(),
    isAuthCookie: isAuthCookieName(name),
  }));
}

export function summarizeAuthCookies(
  cookies: ReadonlyArray<{ name: string; value?: string }>,
): {
  hasAuthCookies: boolean;
  authCookieNames: string[];
  authCookieValueLengths: number[];
  totalCookieCount: number;
} {
  const authCookies = cookies.filter(({ name }) => isAuthCookieName(name));
  return {
    hasAuthCookies: authCookies.length > 0,
    authCookieNames: authCookies.map(({ name }) => name),
    authCookieValueLengths: authCookies.map(({ value }) => value?.length ?? 0),
    totalCookieCount: cookies.length,
  };
}

export function summarizeRequestHeaders(request: NextRequest | Headers): Record<string, unknown> {
  const headers = request instanceof Headers ? request : request.headers;
  const cookieHeader = headers.get("cookie");

  return {
    userAgent: headers.get("user-agent"),
    cookieHeaderLength: cookieHeader?.length ?? 0,
    referer: headers.get("referer"),
    origin: headers.get("origin"),
    host: headers.get("host"),
    xForwardedProto: headers.get("x-forwarded-proto"),
    xForwardedHost: headers.get("x-forwarded-host"),
    secFetchSite: headers.get("sec-fetch-site"),
    secFetchMode: headers.get("sec-fetch-mode"),
    secFetchDest: headers.get("sec-fetch-dest"),
    accept: headers.get("accept"),
    cacheControl: headers.get("cache-control"),
    pragma: headers.get("pragma"),
  };
}

export function summarizeResponseHeaders(response: NextResponse | Headers): Record<string, unknown> {
  const headers = response instanceof Headers ? response : response.headers;

  return {
    location: headers.get("location"),
    cacheControl: headers.get("cache-control"),
    contentSecurityPolicy: headers.get("content-security-policy"),
    strictTransportSecurity: headers.get("strict-transport-security"),
    crossOriginOpenerPolicy: headers.get("cross-origin-opener-policy"),
    setCookieCount: headers.getSetCookie?.()?.length ?? null,
    setCookieNames: headers
      .getSetCookie?.()
      ?.map((entry) => entry.split("=")[0]?.trim())
      .filter(Boolean) ?? null,
  };
}

export function summarizeNextRequest(request: NextRequest): Record<string, unknown> {
  const browser = classifyBrowser(request.headers.get("user-agent"));
  const authCookies = summarizeAuthCookies(request.cookies.getAll());

  return {
    browser,
    protocol: request.nextUrl.protocol,
    hostname: request.nextUrl.hostname,
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search || null,
    method: request.method,
    ...authCookies,
    cookiesReceived: summarizeCookies(request.cookies.getAll()),
    requestHeaders: summarizeRequestHeaders(request),
  };
}

export function logSafariAccountComparison(
  source: string,
  phase: ServerAuthPhase,
  details: Record<string, unknown>,
): void {
  console.error(`[SERVER DEBUG SafariCompare ${source}] ${phase}`, details);
}

export function serializeError(error: unknown): {
  message: string;
  name?: string;
  stack?: string;
  digest?: string;
} {
  if (error instanceof Error) {
    const digest =
      "digest" in error && typeof (error as Error & { digest?: string }).digest === "string"
        ? (error as Error & { digest?: string }).digest
        : undefined;

    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
      digest,
    };
  }

  return {
    message: typeof error === "string" ? error : "Unknown throw",
  };
}

export function logServerAuthDebug(
  source: string,
  phase: ServerAuthPhase,
  details: Record<string, unknown> = {},
): void {
  console.error(`[SERVER DEBUG ${source}] ${phase}`, details);
}

export function logServerAuthException(
  source: string,
  error: unknown,
  details: Record<string, unknown> = {},
): void {
  console.error(`[SERVER DEBUG ${source}] exception`, {
    ...details,
    error: serializeError(error),
  });
}

export function isNextNavigationError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const digest = (error as { digest?: string }).digest;
  return digest === "NEXT_REDIRECT" || digest === "NEXT_NOT_FOUND";
}

/** Log then rethrow so Next.js error boundaries still activate. */
export function logAndRethrow(source: string, error: unknown, details: Record<string, unknown> = {}): never {
  if (!isNextNavigationError(error)) {
    logServerAuthException(source, error, details);
  }
  throw error;
}

export function logAuthSessionMismatch(
  source: string,
  context: {
    pathname?: string;
    browser?: BrowserSummary;
    middlewareUserId?: string | null;
    serverComponentUserId?: string | null;
    authCookies?: ReturnType<typeof summarizeAuthCookies>;
  },
): void {
  const mismatch =
    context.middlewareUserId !== context.serverComponentUserId ||
    (context.authCookies?.hasAuthCookies && !context.serverComponentUserId) ||
    (!context.authCookies?.hasAuthCookies && Boolean(context.serverComponentUserId));

  if (!mismatch && context.browser?.isSafari !== true) {
    return;
  }

  logSafariAccountComparison(source, "safari-compare", {
    ...context,
    sessionMismatch: mismatch,
    note: mismatch
      ? "Auth cookies and resolved user id disagree — likely Safari cookie / SameSite issue"
      : "Safari request logged for comparison with Chrome",
  });
}

export function summarizeRscRequestHeaders(headerStore: Headers): {
  browser: BrowserSummary;
  requestHeaders: Record<string, string | number | null>;
} {
  const browser = classifyBrowser(headerStore.get("user-agent"));

  return {
    browser,
    requestHeaders: {
      userAgent: headerStore.get("user-agent"),
      cookieHeaderLength: headerStore.get("cookie")?.length ?? 0,
      referer: headerStore.get("referer"),
      host: headerStore.get("host"),
      xForwardedProto: headerStore.get("x-forwarded-proto"),
      secFetchSite: headerStore.get("sec-fetch-site"),
      secFetchMode: headerStore.get("sec-fetch-mode"),
      cacheControl: headerStore.get("cache-control"),
    },
  };
}

export const CSP_CONNECT_SRC = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
})();
