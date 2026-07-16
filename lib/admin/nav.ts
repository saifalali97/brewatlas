import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Coffee,
  Cpu,
  Globe2,
  Home,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  Sparkles,
  Star,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { adminCopy } from "@/lib/admin/copy";
import { ADMIN_CMS_PATHS } from "@/lib/admin/cms-paths";

export type AdminNavItemId =
  | "dashboard"
  | "homepage"
  | "heroBanners"
  | "featuredRecipes"
  | "homepageSections"
  | "users"
  | "recipes"
  | "media"
  | "devices"
  | "origins"
  | "roasters"
  | "reviews"
  | "subscriptions"
  | "analytics";

export type AdminNavItem = {
  id: AdminNavItemId;
  href: string;
  label: string;
  icon: LucideIcon;
};

export function buildAdminNavItems(): AdminNavItem[] {
  const labels = adminCopy.nav;
  return [
    { id: "dashboard", href: ADMIN_CMS_PATHS.home, label: labels.dashboard, icon: LayoutDashboard },
    { id: "homepage", href: ADMIN_CMS_PATHS.homepage, label: labels.homepage, icon: Home },
    { id: "heroBanners", href: ADMIN_CMS_PATHS.heroBanners, label: labels.heroBanners, icon: Sparkles },
    { id: "featuredRecipes", href: ADMIN_CMS_PATHS.featuredRecipes, label: labels.featuredRecipes, icon: Star },
    { id: "homepageSections", href: ADMIN_CMS_PATHS.homepageSections, label: labels.homepageSections, icon: LayoutTemplate },
    { id: "recipes", href: ADMIN_CMS_PATHS.recipes, label: labels.recipes, icon: Coffee },
    { id: "media", href: ADMIN_CMS_PATHS.media, label: labels.media, icon: Image },
    { id: "devices", href: ADMIN_CMS_PATHS.devices, label: labels.devices, icon: Cpu },
    { id: "origins", href: ADMIN_CMS_PATHS.origins, label: labels.origins, icon: Globe2 },
    { id: "roasters", href: ADMIN_CMS_PATHS.roasters, label: labels.roasters, icon: Store },
    { id: "users", href: ADMIN_CMS_PATHS.users, label: labels.users, icon: Users },
    { id: "reviews", href: ADMIN_CMS_PATHS.reviews, label: labels.reviews, icon: Star },
    { id: "subscriptions", href: ADMIN_CMS_PATHS.subscriptions, label: labels.subscriptions, icon: Wallet },
    { id: "analytics", href: ADMIN_CMS_PATHS.analytics, label: labels.analytics, icon: BarChart3 },
  ];
}

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === ADMIN_CMS_PATHS.home) return pathname === ADMIN_CMS_PATHS.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}
