import type { SupabaseClient, User } from "@supabase/supabase-js";
import { resolveIsAdmin } from "@/lib/auth/is-admin";
import { roleCanAccessDashboard, roleHasPermission } from "@/lib/auth/permissions";
import type { AppRole, Permission } from "@/types/auth";

/** Prefix for the isolated BrewAtlas CMS (owner dashboard). */
export const OWNER_DASHBOARD_PREFIX = "/dashboard";

/** Prefix for the app admin area (RBAC: admin role required). */
export const ADMIN_PATH_PREFIX = "/admin";

/** Prefix for the signed-in user's personal hub (not the CMS). */
export const ACCOUNT_PATH_PREFIX = "/account";

export function isOwnerDashboardPath(pathname: string): boolean {
  return pathname === OWNER_DASHBOARD_PREFIX || pathname.startsWith(`${OWNER_DASHBOARD_PREFIX}/`);
}

export function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH_PREFIX || pathname.startsWith(`${ADMIN_PATH_PREFIX}/`);
}

export function isAdminApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

export function isAccountPath(pathname: string): boolean {
  return pathname === ACCOUNT_PATH_PREFIX || pathname.startsWith(`${ACCOUNT_PATH_PREFIX}/`);
}

export async function canAccessAdminArea(supabase: SupabaseClient, userId: string): Promise<boolean> {
  return resolveIsAdmin(supabase, userId);
}

export async function resolveUserRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<AppRole | null> {
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (!profile?.role) return null;
  return profile.role as AppRole;
}

export async function canAccessOwnerDashboard(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  const role = await resolveUserRole(supabase, user.id);
  return roleCanAccessDashboard(role);
}

export async function userHasPermission(
  supabase: SupabaseClient,
  userId: string,
  permission: Permission,
): Promise<boolean> {
  const role = await resolveUserRole(supabase, userId);
  return roleHasPermission(role, permission);
}
