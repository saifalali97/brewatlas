/** Canonical paths for the BrewAtlas admin CMS (replaces legacy `/dashboard`). */
export const ADMIN_CMS_PREFIX = "/admin";

export function adminCmsPath(segment = ""): string {
  if (!segment) return ADMIN_CMS_PREFIX;
  return segment.startsWith("/") ? `${ADMIN_CMS_PREFIX}${segment}` : `${ADMIN_CMS_PREFIX}/${segment}`;
}

/** Maps a legacy `/dashboard` path to the equivalent `/admin` path. */
export function dashboardToAdminPath(pathname: string): string {
  if (pathname === "/dashboard") return ADMIN_CMS_PREFIX;
  if (pathname.startsWith("/dashboard/")) {
    return `${ADMIN_CMS_PREFIX}${pathname.slice("/dashboard".length)}`;
  }
  return ADMIN_CMS_PREFIX;
}

export const ADMIN_CMS_PATHS = {
  home: ADMIN_CMS_PREFIX,
  recipes: adminCmsPath("recipes"),
  recipesNew: adminCmsPath("recipes/new"),
  recipeEdit: (id: string) => adminCmsPath(`recipes/${id}/edit`),
  recipeVersions: (id: string) => adminCmsPath(`recipes/${id}/versions`),
  media: adminCmsPath("media"),
  devices: adminCmsPath("devices"),
  origins: adminCmsPath("origins"),
  roasters: adminCmsPath("roasters"),
  homepage: adminCmsPath("homepage"),
  heroBanners: adminCmsPath("homepage/hero"),
  featuredRecipes: adminCmsPath("homepage/featured-recipes"),
  homepageSections: adminCmsPath("homepage/sections"),
  users: adminCmsPath("users"),
  reviews: adminCmsPath("reviews"),
  community: adminCmsPath("community"),
  subscriptions: adminCmsPath("subscriptions"),
  analytics: adminCmsPath("analytics"),
  aiCoach: adminCmsPath("ai-coach"),
  settings: adminCmsPath("settings"),
} as const;
