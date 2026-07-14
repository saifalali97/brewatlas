import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { roleCanAccessDashboard } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";

export type OwnerSession = {
  supabase: SupabaseClient;
  user: User;
  role: AppRole;
  displayName: string;
};

async function loadOwnerSession(supabase: SupabaseClient, user: User): Promise<OwnerSession | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !roleCanAccessDashboard(profile.role)) {
    return null;
  }

  return {
    supabase,
    user,
    role: profile.role as AppRole,
    displayName: profile.full_name?.trim() || user.email?.split("@")[0] || "Owner",
  };
}

/** Server-only gate for CMS routes. Redirects unauthenticated users to login and everyone else to home. */
export async function requireOwner(redirectTo = "/dashboard"): Promise<OwnerSession> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const session = await loadOwnerSession(supabase, authData.user);
  if (!session) {
    redirect("/");
  }

  return session;
}

/** Used by proxy middleware — returns null when the caller cannot access the CMS. */
export async function getOwnerSessionFromMiddleware(
  supabase: SupabaseClient,
  user: User,
): Promise<OwnerSession | null> {
  return loadOwnerSession(supabase, user);
}
