import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";
import { isRbacAdminRole } from "@/types/auth";

export type AdminSession = {
  supabase: SupabaseClient;
  user: User;
  role: AppRole;
  displayName: string;
};

/** Resolves whether a profile role grants admin access to `/admin` routes. */
export function roleIsAdmin(role: string | null | undefined): boolean {
  return isRbacAdminRole(role);
}

/** Server-side admin check for a specific user id (uses the caller's session + RLS). */
export async function resolveIsAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("resolveIsAdmin: profile lookup failed", error);
    return false;
  }

  return roleIsAdmin(profile?.role);
}

/** Returns true when the given user has admin access. */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  return resolveIsAdmin(supabase, userId);
}

/** Gate for `/admin` pages and server actions. Redirects guests to login and non-admins to home. */
export async function requireAdmin(redirectTo = "/admin"): Promise<AdminSession> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (!roleIsAdmin(profile?.role)) {
    redirect("/");
  }

  const displayName =
    profile?.full_name?.trim() ||
    authData.user.email?.split("@")[0] ||
    "Admin";

  return {
    supabase,
    user: authData.user,
    role: (profile?.role as AppRole | undefined) ?? "user",
    displayName,
  };
}
