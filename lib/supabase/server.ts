import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import {
  logSafariAccountComparison,
  logServerAuthDebug,
  logServerAuthException,
  summarizeAuthCookies,
  summarizeCookieOptions,
  summarizeCookies,
  summarizeRscRequestHeaders,
} from "@/lib/debug/server-auth-debug";

/**
 * Supabase client for use in Server Components, Server Actions, and Route
 * Handlers. Must be created fresh on every request because it reads/writes
 * cookies from the current request context via Next.js's async `cookies()`.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authCookies = summarizeAuthCookies(cookieStore.getAll());

  logServerAuthDebug("createClient", "entry", {
    cookiesReceived: summarizeCookies(cookieStore.getAll()),
    ...authCookies,
    rsc: summarizeRscRequestHeaders(headerStore),
  });

  logSafariAccountComparison("createClient", "entry", {
    ...authCookies,
    rsc: summarizeRscRequestHeaders(headerStore),
    note: "Server Component / Server Action cookie jar — compare with updateSession for Safari",
  });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
            logServerAuthDebug("createClient", "cookie-write", {
              cookiesWritten: summarizeCookieOptions(cookiesToSet),
            });
            logSafariAccountComparison("createClient", "cookie-write", {
              cookiesWritten: summarizeCookieOptions(cookiesToSet),
              note: "RSC attempted cookie write — fails silently in Server Components on some paths",
            });
          } catch (cookieError) {
            logServerAuthException("createClient", cookieError, {
              phase: "setAll",
              note: "Server Component cookie write failed — proxy should refresh session",
            });
          }
        },
      },
    },
  );
}
