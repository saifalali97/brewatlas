import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Coffee,
  Cpu,
  FolderOpen,
  Globe2,
  Image,
  LayoutDashboard,
  Settings,
  Star,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/types";

export type OwnerNavItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  permission: "cms.access";
};

export function buildOwnerNavItems(labels: Dictionary["ownerNav"]): OwnerNavItem[] {
  return [
    { id: "dashboard", href: "/dashboard", label: labels.dashboard, icon: LayoutDashboard, permission: "cms.access" },
    { id: "recipes", href: "/dashboard/recipes", label: labels.recipes, icon: Coffee, permission: "cms.access" },
    { id: "media", href: "/dashboard/media", label: labels.media, icon: Image, permission: "cms.access" },
    { id: "origins", href: "/dashboard/origins", label: labels.origins, icon: Globe2, permission: "cms.access" },
    { id: "roasters", href: "/dashboard/roasters", label: labels.roasters, icon: Store, permission: "cms.access" },
    { id: "brewers", href: "/dashboard/brewers", label: labels.brewers, icon: Users, permission: "cms.access" },
    { id: "devices", href: "/dashboard/devices", label: labels.devices, icon: Cpu, permission: "cms.access" },
    { id: "collections", href: "/dashboard/collections", label: labels.collections, icon: FolderOpen, permission: "cms.access" },
    { id: "reviews", href: "/dashboard/reviews", label: labels.reviews, icon: Star, permission: "cms.access" },
    { id: "users", href: "/dashboard/users", label: labels.users, icon: Users, permission: "cms.access" },
    { id: "subscriptions", href: "/dashboard/subscriptions", label: labels.subscriptions, icon: Wallet, permission: "cms.access" },
    { id: "analytics", href: "/dashboard/analytics", label: labels.analytics, icon: BarChart3, permission: "cms.access" },
    { id: "notifications", href: "/dashboard/notifications", label: labels.notifications, icon: Bell, permission: "cms.access" },
    { id: "settings", href: "/dashboard/settings", label: labels.settings, icon: Settings, permission: "cms.access" },
  ];
}

export function isOwnerNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}
