import type { AppRole, DashboardRole, Permission } from "@/types/auth";
import { DASHBOARD_ROLES } from "@/types/auth";

/**
 * Role → permission matrix for the BrewAtlas CMS.
 * Phase 21.1 gates `/dashboard` to `owner` only; other roles are prepared
 * for future phased rollouts without refactoring this map.
 */
export const ROLE_PERMISSIONS: Record<Permission, readonly DashboardRole[]> = {
  "cms.access": ["owner"],
  "cms.manage_all": ["owner"],
  "cms.recipes": ["owner"],
  "cms.origins": ["owner"],
  "cms.roasters": ["owner"],
  "cms.brewers": ["owner"],
  "cms.devices": ["owner"],
  "cms.collections": ["owner"],
  "cms.reviews": ["owner"],
  "cms.users": ["owner"],
  "cms.subscriptions": ["owner"],
  "cms.analytics": ["owner"],
  "cms.notifications": ["owner"],
  "cms.settings": ["owner"],
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
