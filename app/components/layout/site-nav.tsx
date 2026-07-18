"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { DebugErrorBoundary } from "@/app/components/debug/debug-error-boundary";
import { DebugMountLogger } from "@/app/components/debug/debug-mount-logger";
import { DiscoverMenu } from "@/app/components/layout/discover-menu";
import { LanguageSwitcher } from "@/app/components/layout/language-switcher";
import { MobileNavDrawer } from "@/app/components/layout/mobile-nav-drawer";
import { TextLink } from "@/app/components/ui/text-link";
import { dsFocus, dsLayout, dsMotion, dsShadow } from "@/lib/constants/styles";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";

const defaultNavLabels: Dictionary["nav"] = {
  home: "Home",
  discover: "Discover",
  recipes: "Recipes",
  search: "Search",
  methods: "Methods",
  origins: "Origins",
  roasters: "Roasters",
  devices: "Devices",
  culture: "Culture",
  coach: "AI Coach",
  pricing: "Premium",
  faq: "FAQ",
  dashboard: "Dashboard",
  admin: "Admin",
  community: "Community",
  profile: "Profile",
  settings: "Settings",
  account: "Account",
  joinPremium: "Join Premium",
  login: "Log in",
  signup: "Sign up",
  logout: "Log out",
  skipToMainContent: "Skip to main content",
  mainNavigationAriaLabel: "Main navigation",
  homeAriaLabel: "BrewAtlas home",
  joinPremiumAriaLabel: "Join BrewAtlas Premium",
  discoverMenuAriaLabel: "Discover menu",
  mobileMenuAriaLabel: "Mobile navigation menu",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  switchLanguageAria: "Switch to {language}",
  languageAriaLabel: "Language",
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav({
  nav = defaultNavLabels,
  locale = DEFAULT_LOCALE,
  isAuthenticated = false,
  isAdmin = false,
  notificationsSlot = null,
}: {
  nav?: Dictionary["nav"];
  locale?: Locale;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  notificationsSlot?: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";
  const onHero = isHome && !scrolled;

  const discoverLinks = useMemo(
    () => [
      { href: "/devices", label: nav.devices },
      { href: "/origins", label: nav.origins },
      { href: "/roasters", label: nav.roasters },
      { href: "/culture", label: nav.culture },
      { href: "/methods", label: nav.methods },
      { href: "/search", label: nav.search },
    ],
    [nav],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const recipesActive = isActivePath(pathname, "/recipes");
  const premiumActive = isActivePath(pathname, "/premium");
  const adminActive = isActivePath(pathname, "/admin");

  const linkBase = onHero ? "text-ba-sand-deep/85 hover:text-ba-pearl" : "text-ba-coffee/70 hover:text-ba-espresso";
  const linkActive = onHero ? "text-ba-pearl" : "text-ba-espresso";
  const premiumLink = onHero ? "text-ba-gold hover:text-ba-pearl" : "text-ba-bronze hover:text-ba-espresso";
  const wordmark = onHero ? "text-ba-pearl" : "text-ba-espresso";

  return (
    <>
      <header
        id="site-header"
        className={joinClasses(
          "site-header-mobile pointer-events-auto border-b",
          "max-lg:fixed max-lg:inset-x-0 max-lg:top-0 lg:sticky lg:top-0 z-[100]",
          "max-lg:pt-[env(safe-area-inset-top,0px)]",
          dsMotion.transitionSlow,
          "backdrop-blur-2xl backdrop-saturate-150",
          onHero
            ? "border-transparent bg-transparent"
            : joinClasses(
                "border-ba-espresso/[0.06] bg-ba-pearl/90",
                scrolled ? dsShadow.header : "",
              ),
        )}
      >
        <nav
          aria-label={nav.mainNavigationAriaLabel}
          className={joinClasses(
            dsLayout.containerWide,
            dsLayout.pagePx,
            "relative flex items-center justify-between",
            dsLayout.headerHeight,
          )}
        >
          <div className="flex items-center gap-8">
            <Link
              href="/"
              aria-label={nav.homeAriaLabel}
              className={joinClasses(
                "font-display text-xl tracking-[-0.02em]",
                wordmark,
                dsMotion.transition,
                "hover:opacity-80",
                onHero ? dsFocus.ringDark : dsFocus.ring,
              )}
            >
              BrewAtlas
            </Link>

            <div className="hidden items-center gap-8 lg:flex">
              <DiscoverMenu
                label={nav.discover}
                menuAriaLabel={nav.discoverMenuAriaLabel}
                links={discoverLinks}
                onDark={onHero}
              />

              <Link
                href="/recipes"
                aria-current={recipesActive ? "page" : undefined}
                className={joinClasses(
                  "group relative px-0.5 py-1.5 text-sm font-medium",
                  dsMotion.transition,
                  recipesActive ? linkActive : linkBase,
                  onHero ? dsFocus.ringDark : dsFocus.ring,
                )}
              >
                {nav.recipes}
                <span
                  className={joinClasses(
                    "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-ba-gold transition-all duration-500",
                    dsMotion.easing,
                    recipesActive
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60",
                  )}
                  aria-hidden
                />
              </Link>

              <Link
                href="/premium"
                aria-current={premiumActive ? "page" : undefined}
                className={joinClasses(
                  "group relative px-0.5 py-1.5 text-sm font-medium",
                  dsMotion.transition,
                  premiumActive ? (onHero ? "text-ba-gold" : "text-ba-bronze") : premiumLink,
                  onHero ? dsFocus.ringDark : dsFocus.ring,
                )}
              >
                {nav.pricing}
              </Link>

              {isAdmin ? (
                <Link
                  href="/admin"
                  aria-current={adminActive ? "page" : undefined}
                  className={joinClasses(
                    "group relative px-0.5 py-1.5 text-sm font-medium",
                    dsMotion.transition,
                    adminActive ? linkActive : linkBase,
                    onHero ? dsFocus.ringDark : dsFocus.ring,
                  )}
                >
                  {nav.admin}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="pointer-events-none flex items-center gap-2 sm:gap-3">
            <div className="pointer-events-auto hidden items-center gap-3 lg:flex">
              {notificationsSlot}
              <LanguageSwitcher
                currentLocale={locale}
                switchLanguageAria={nav.switchLanguageAria}
                languageAriaLabel={nav.languageAriaLabel}
                onDark={onHero}
              />
              <TextLink
                href={isAuthenticated ? "/account" : "/login"}
                variant={isAuthenticated ? (onHero ? "navActiveOnDark" : "navActive") : onHero ? "navOnDark" : "nav"}
                className="min-h-11 items-center px-2"
              >
                {isAuthenticated ? nav.account : nav.login}
              </TextLink>
            </div>

            <button
              id="mobile-menu-button"
              type="button"
              data-mobile-nav-trigger
              aria-label={nav.openMenu}
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className={joinClasses(
                "pointer-events-auto flex h-11 w-11 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border touch-manipulation lg:hidden",
                "[-webkit-tap-highlight-color:transparent] [touch-action:manipulation]",
                dsMotion.transition,
                "active:scale-[0.98]",
                onHero
                  ? "border-white/[0.15] bg-white/[0.06] text-ba-pearl hover:border-ba-gold/35"
                  : "border-ba-espresso/10 bg-ba-pearl text-ba-coffee hover:border-ba-bronze/30",
                onHero ? dsFocus.ringDark : dsFocus.ring,
              )}
            >
              <Menu className="pointer-events-none h-5 w-5" aria-hidden />
            </button>
          </div>
        </nav>
      </header>

      <DebugErrorBoundary name="MobileNavDrawer">
        <DebugMountLogger name="MobileNavDrawer">
          <MobileNavDrawer
            open={open}
            onClose={() => setOpen(false)}
            nav={nav}
            locale={locale}
            discoverLinks={discoverLinks}
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            notificationsSlot={notificationsSlot}
          />
        </DebugMountLogger>
      </DebugErrorBoundary>
    </>
  );
}
