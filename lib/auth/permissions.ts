import type { AppRole, DashboardRole, Permission } from "@/types/auth";
import { DASHBOARD_ROLES } from "@/types/auth";

/**
 * Role → permission matrix for the BrewAtlas CMS.
 * Phase 21.1 gates `/dashboard` to `owner` only; other roles are prepared
 * for future phased rollouts without refactoring this map.
 */
export const ROLE_PERMISSIONS: Record<Permission, readonly DashboardRole[]> = {
  "cms.access": ["owner", "admin"],
  "cms.manage_all": ["owner", "admin"],
  "cms.recipes": ["owner", "admin"],
  "cms.origins": ["owner", "admin"],
  "cms.roasters": ["owner", "admin"],
  "cms.brewers": ["owner", "admin"],
  "cms.devices": ["owner", "admin"],
  "cms.collections": ["owner", "admin"],
  "cms.reviews": ["owner", "admin"],
  "cms.users": ["owner", "admin"],
  "cms.subscriptions": ["owner", "admin"],
  "cms.analytics": ["owner", "admin"],
  "cms.notifications": ["owner", "admin"],
  "cms.settings": ["owner", "admin"],
};

export function isDashboardRole(role: string | null | undefined): role is DashboardRole {
  return DASHBOARD_ROLES.includes(role as DashboardRole);
}

export function roleHasPermission(role: AppRole | string | null | undefined, permission: Permission): boolean {
  if (!role || role === "user") return false;
  const allowed = ROLE_PERMISSIONS[permission];
  return allowed.includes(role as DashboardRole);
}

export function roleCanAccessDashboard(role: AppRole | string | null | undefined): boolean {
  return roleHasPermission(role, "cms.access");
}
