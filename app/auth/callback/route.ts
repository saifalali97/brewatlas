import { NextResponse, type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/seo/site";
import { ensureProfile } from "@/lib/supabase/profile";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges the PKCE `code` param Supabase appends to email confirmation,
 * password reset, and OAuth redirect links for a real session, then
 * forwards the user to `next` (defaults to /account). Required by the
 * official Supabase SSR pattern - Server Components can't set cookies, so
 * the session cookie exchange has to happen in a Route Handler like this.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const redirectBase =
    process.env.NODE_ENV === "production"
      ? getSiteUrl()
      : request.nextUrl.origin.replace(/\/$/, "");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (data.user) {
        await ensureProfile(supabase, data.user);
      }
      return NextResponse.redirect(`${redirectBase}${safeNext}`);
    }

    return NextResponse.redirect(
      `${redirectBase}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${redirectBase}/login?error=${encodeURIComponent("Missing or invalid confirmation code.")}`,
  );
}
