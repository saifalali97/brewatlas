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
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
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

  // Legacy owner CMS — permanently redirect to `/admin`.
  if (isOwnerDashboardPath(pathname)) {
    const adminPath = dashboardToAdminPath(pathname);
    return NextResponse.redirect(new URL(adminPath, request.url));
  }

  if (isAdminPath(pathname) || isAdminApiPath(pathname)) {
    if (!user) {
      if (isAdminApiPath(pathname)) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      }

      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    const allowed = await canAccessAdminArea(supabase, user.id);
    if (!allowed) {
      if (isAdminApiPath(pathname)) {
        return NextResponse.json({ error: "Forbidden." }, { status: 403 });
      }

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
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAccountPath(pathname) && !user) {
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

export { ACCOUNT_PATH_PREFIX };
