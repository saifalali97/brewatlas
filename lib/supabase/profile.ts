import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensures a `profiles` row exists for the given auth user, inserting one if
 * missing. The `profiles` migration already provisions this automatically
 * via a `handle_new_user` trigger on `auth.users`, but this app-level
 * fallback keeps sign-up/sign-in/OAuth callback flows correct even before
 * that migration has been applied to a given environment, and for any
 * account created before the trigger existed.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Email sign-up with confirmation enabled returns a user but no session;
  // PostgREST would run as anon and the profiles INSERT policy would reject.
  if (!session) {
    return;
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
    // Upsert defaults to treating omitted columns as NULL; the INSERT RLS
    // policy requires role = 'user', so request DB defaults instead.
    { onConflict: "id", ignoreDuplicates: true, defaultToNull: false },
  );

  if (error) {
    console.error("ensureProfile: failed to provision profile row", error);
  }
}
