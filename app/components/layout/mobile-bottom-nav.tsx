"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Home, Search, User, Users } from "lucide-react";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { useTranslations } from "@/lib/i18n/translation-context";

type NavItem = {
  href: string;
  labelKey: "nav.home" | "nav.recipes" | "nav.search" | "nav.community" | "nav.account" | "nav.login";
  icon: typeof Home;
  match: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  { href: "/", labelKey: "nav.home", icon: Home, match: (pathname) => pathname === "/" },
  {
    href: "/recipes",
    labelKey: "nav.recipes",
    icon: Coffee,
    match: (pathname) => pathname === "/recipes" || pathname.startsWith("/recipes/"),
  },
  {
    href: "/search",
    labelKey: "nav.search",
    icon: Search,
    match: (pathname) => pathname === "/search" || pathname.startsWith("/search/"),
  },
  {
    href: "/community",
    labelKey: "nav.community",
    icon: Users,
    match: (pathname) => pathname === "/community" || pathname.startsWith("/community/"),
  },
];

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type MobileBottomNavProps = {
  isAuthenticated: boolean;
};

/** Mobile quick navigation — primary destinations with clear active states. */
export function MobileBottomNav({ isAuthenticated }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { t } = useTranslations();

  const accountItem: NavItem = {
    href: isAuthenticated ? "/account" : "/login",
    labelKey: isAuthenticated ? "nav.account" : "nav.login",
    icon: User,
    match: (path) => path === "/account" || path.startsWith("/account/") || path === "/login",
  };

  const items = [...navItems, accountItem];

  return (
    <nav
      aria-label={t("nav.mainNavigationAriaLabel")}
      className="fixed inset-x-0 bottom-0 z-[90] border-t border-ba-espresso/[0.08] bg-ba-pearl/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-2 pt-1">
        {items.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={joinClasses(
                  "relative flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[0.625rem] font-medium tracking-[0.02em] transition-all duration-300 touch-manipulation active:scale-95",
                  isActive ? "text-ac-espresso" : "text-ac-espresso/60 hover:text-ac-espresso",
                  acFocus.ring,
                )}
              >
                <Icon
                  className={joinClasses(
                    "h-[1.125rem] w-[1.125rem] transition-all duration-300",
                    isActive ? "scale-110 text-ac-copper" : "scale-100",
                  )}
                  aria-hidden
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span>{t(item.labelKey)}</span>
                {isActive ? (
                  <span aria-hidden className="absolute bottom-1 h-0.5 w-5 rounded-full bg-ac-copper" />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
