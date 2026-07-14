/** CMS team roles stored on `public.profiles.role`. */
export const DASHBOARD_ROLES = ["owner", "admin", "editor", "reviewer", "writer"] as const;
export type DashboardRole = (typeof DASHBOARD_ROLES)[number];

/** All supported profile roles, including regular app users. */
export const APP_ROLES = ["user", ...DASHBOARD_ROLES] as const;
export type AppRole = (typeof APP_ROLES)[number];

/** Fine-grained CMS permissions. Only `owner` has every permission in Phase 21.1. */
export const PERMISSIONS = [
  "cms.access",
  "cms.manage_all",
  "cms.recipes",
  "cms.origins",
  "cms.roasters",
  "cms.brewers",
  "cms.devices",
  "cms.collections",
  "cms.reviews",
  "cms.users",
  "cms.subscriptions",
  "cms.analytics",
  "cms.notifications",
  "cms.settings",
] as const;

export type Permission = (typeof PERMISSIONS)[number];
