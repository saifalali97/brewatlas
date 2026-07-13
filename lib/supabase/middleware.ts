import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Routes that require a signed-in user. Matched by prefix against the
 * request pathname.
 */
const PROTECTED_PATH_PREFIXES = ["/dashboard"];

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
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: Avoid writing logic between createServerClient and this
  // getUser() call, and never skip it - it revalidates the session token
  // and is what actually keeps the user signed in across requests.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // IMPORTANT: You must return the supabaseResponse object as-is. Creating
  // a new response object loses the refreshed auth cookies. If you need to
  // return a different response, copy its cookies onto a `NextResponse`
  // built from `supabaseResponse` instead of building one from scratch.
  return supabaseResponse;
}
