import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";

/**
 * Exchanges the PKCE `code` param Supabase appends to email confirmation,
 * password reset, and OAuth redirect links for a real session, then
 * forwards the user to `next` (defaults to /dashboard). Required by the
 * official Supabase SSR pattern - Server Components can't set cookies, so
 * the session cookie exchange has to happen in a Route Handler like this.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data.user) {
        await ensureProfile(supabase, data.user);
      }
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Missing or invalid confirmation code.")}`,
  );
}
