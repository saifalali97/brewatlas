"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Menu } from "lucide-react";
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

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

type HitTestStyles = {
  position: string;
  zIndex: string;
  pointerEvents: string;
  top: string;
  right: string;
  bottom: string;
  left: string;
  overflow: string;
  transform: string;
  filter: string;
  backdropFilter: string;
  opacity: string;
  contain: string;
  isolation: string;
};

type HitTestElement = {
  tag: string;
  id: string | null;
  className: string | null;
  styles: HitTestStyles;
  createsStackingContext: boolean;
};

type BlockerReport = {
  topElement: HitTestElement | null;
  buttonIsTop: boolean;
  stack: HitTestElement[];
  isolationFix: string | null;
  samplePoint: { x: number; y: number };
};

function readHitStyles(element: Element): HitTestStyles {
  const cs = getComputedStyle(element);
  return {
    position: cs.position,
    zIndex: cs.zIndex,
    pointerEvents: cs.pointerEvents,
    top: cs.top,
    right: cs.right,
    bottom: cs.bottom,
    left: cs.left,
    overflow: cs.overflow,
    transform: cs.transform,
    filter: cs.filter,
    backdropFilter: cs.backdropFilter,
    opacity: cs.opacity,
    contain: cs.contain,
    isolation: cs.isolation,
  };
}

function createsStackingContext(styles: HitTestStyles) {
  if (styles.isolation === "isolate") return true;
  if (styles.transform !== "none") return true;
  if (styles.filter !== "none") return true;
  if (styles.backdropFilter !== "none") return true;
  if (Number.parseFloat(styles.opacity) < 1) return true;
  if (styles.contain !== "none") return true;
  if (styles.zIndex !== "auto" && styles.position !== "static") return true;
  return false;
}

function describeHitElement(element: Element | null): HitTestElement | null {
  if (!element) return null;
  const styles = readHitStyles(element);
  return {
    tag: element.tagName,
    id: element.id || null,
    className: typeof element.className === "string" ? element.className.slice(0, 100) : null,
    styles,
    createsStackingContext: createsStackingContext(styles),
  };
}

function formatBlockerLabel(element: HitTestElement | null) {
  if (!element) return "none";
  const id = element.id ? `#${element.id}` : "";
  const cls = element.className ? `.${element.className.split(/\s+/).slice(0, 2).join(".")}` : "";
  return `${element.tag}${id}${cls}`;
}

function runBlockerReport(button: HTMLButtonElement): BlockerReport {
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const header = document.getElementById("site-header");
  const topElement = document.elementFromPoint(x, y);
  const stack = document
    .elementsFromPoint(x, y)
    .slice(0, 12)
    .map((element) => describeHitElement(element))
    .filter((element): element is HitTestElement => element !== null);

  const buttonIsTop =
    topElement === button || (topElement !== null && button.contains(topElement));

  let isolationFix: string | null = null;
  const nav = button.closest("nav");
  if (nav) {
    for (const sibling of Array.from(nav.children)) {
      if (sibling.contains(button)) continue;
      const previous = (sibling as HTMLElement).style.pointerEvents;
      (sibling as HTMLElement).style.pointerEvents = "none";
      const after = document.elementFromPoint(x, y);
      (sibling as HTMLElement).style.pointerEvents = previous;
      if (after === button || button.contains(after)) {
        isolationFix = formatBlockerLabel(describeHitElement(sibling));
        break;
      }
    }
  }

  if (!isolationFix && header) {
    for (const candidate of stack) {
      const element = candidate.id
        ? document.getElementById(candidate.id)
        : document.querySelector(
            candidate.tag + (candidate.className ? `.${candidate.className.split(/\s+/)[0]}` : ""),
          );
      if (!element || element === button || button.contains(element) || header.contains(element)) {
        continue;
      }
      const previous = (element as HTMLElement).style.pointerEvents;
      (element as HTMLElement).style.pointerEvents = "none";
      const after = document.elementFromPoint(x, y);
      (element as HTMLElement).style.pointerEvents = previous;
      if (after === button || button.contains(after)) {
        isolationFix = formatBlockerLabel(describeHitElement(element));
        break;
      }
    }
  }

  const report: BlockerReport = {
    topElement: describeHitElement(topElement),
    buttonIsTop,
    stack,
    isolationFix,
    samplePoint: { x, y },
  };

  console.log("[HamburgerDebug] blocker report", report);
  return report;
}

export function SiteNav({
  nav = defaultNavLabels,
  locale = DEFAULT_LOCALE,
  isAuthenticated = false,
  notificationsSlot = null,
}: {
  nav?: Dictionary["nav"];
  locale?: Locale;
  isAuthenticated?: boolean;
  notificationsSlot?: ReactNode;
}) {
  console.log("SITE NAV VERSION 15 JULY");

  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hydrated = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
  const [scrolled, setScrolled] = useState(false);
  const [blockerReport, setBlockerReport] = useState<BlockerReport | null>(null);
  const [lastTouchTarget, setLastTouchTarget] = useState<string>("—");
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log("drawer prop", open);
  }, [open]);

  const handleClose = () => {
    console.log("SiteNav onClose called, open before close:", open);
    setOpen(false);
  };

  console.log("OPEN:", open);

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
    console.log("[HamburgerDebug] SiteNav useEffect ran — client JS is alive");

    const button = menuButtonRef.current;
    if (!button) {
      console.log("[HamburgerDebug] menu button ref is NULL on mount");
      return;
    }

    try {
      setBlockerReport(runBlockerReport(button));
    } catch (error) {
      console.error("[HamburgerDebug] mount blocker report failed", error);
    }

    const logEvent =
      (name: string) =>
      (event: Event) => {
        console.log(`[Hamburger] ${name}`, {
          defaultPrevented: event.defaultPrevented,
          cancelable: event.cancelable,
          target: formatBlockerLabel(describeHitElement(event.target as Element | null)),
        });
        if (name === "touchstart" || name === "pointerdown") {
          try {
            setBlockerReport(runBlockerReport(button));
          } catch (error) {
            console.error("[HamburgerDebug] touch blocker report failed", error);
          }
        }
      };

    const events = ["touchstart", "pointerdown", "mousedown", "click"] as const;
    const handlers = events.map((name) => {
      const handler = logEvent(name);
      button.addEventListener(name, handler, { passive: true });
      return { name, handler };
    });

    const onDocumentTouch = (event: TouchEvent) => {
      const touch = event.touches[0] ?? event.changedTouches[0];
      if (!touch) return;
      const rect = button.getBoundingClientRect();
      const inside =
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom;
      if (!inside) return;

      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const label = formatBlockerLabel(describeHitElement(target));
      setLastTouchTarget(label);
      console.log("[HamburgerDebug] touch in button rect → elementFromPoint:", label);
    };

    document.addEventListener("touchstart", onDocumentTouch, { capture: true, passive: true });

    return () => {
      for (const { name, handler } of handlers) {
        button.removeEventListener(name, handler);
      }
      document.removeEventListener("touchstart", onDocumentTouch, { capture: true });
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const recipesActive = isActivePath(pathname, "/recipes");
  const premiumActive = isActivePath(pathname, "/premium");

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999,
          color: "red",
          fontSize: "10px",
          lineHeight: 1.35,
          maxWidth: "100vw",
          pointerEvents: "none",
        }}
      >
        DEBUG · {hydrated ? "JS HYDRATED" : "SSR ONLY"} · OPEN: {String(open)}
        <br />
        TOP: {blockerReport ? formatBlockerLabel(blockerReport.topElement) : "…"} · btnTop:{" "}
        {blockerReport ? String(blockerReport.buttonIsTop) : "…"}
        <br />
        TOUCH: {lastTouchTarget}
        <br />
        FIX: {blockerReport?.isolationFix ?? "none"}
      </div>
      <header
      id="site-header"
      className={joinClasses(
        "site-header-mobile pointer-events-auto border-b",
        "max-lg:fixed max-lg:inset-x-0 max-lg:top-0 lg:sticky lg:top-0 z-[100]",
        "max-lg:pt-[env(safe-area-inset-top,0px)]",
        dsMotion.transitionSlow,
        "lg:backdrop-blur-2xl lg:backdrop-saturate-150",
        scrolled
          ? joinClasses(
              "border-white/[0.06] bg-uae-dark-coffee-deep max-lg:bg-uae-dark-coffee-deep lg:bg-uae-dark-coffee-deep/92",
              dsShadow.header,
            )
          : "border-white/[0.04] bg-uae-dark-coffee-deep max-lg:bg-uae-dark-coffee-deep lg:bg-uae-dark-coffee-deep/70",
      )}
    >
      <nav
        aria-label={nav.mainNavigationAriaLabel}
        className={joinClasses(
          dsLayout.container,
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
              "text-lg font-semibold tracking-tight text-uae-pearl",
              dsMotion.transition,
              "hover:opacity-80",
              dsFocus.ring,
            )}
          >
            BrewAtlas
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            <DiscoverMenu
              label={nav.discover}
              menuAriaLabel={nav.discoverMenuAriaLabel}
              links={discoverLinks}
            />

            <Link
              href="/recipes"
              aria-current={recipesActive ? "page" : undefined}
              className={joinClasses(
                "group relative px-0.5 py-1.5 text-sm font-medium",
                dsMotion.transition,
                recipesActive ? "text-uae-pearl" : "text-stone-400 hover:text-uae-pearl",
                dsFocus.ring,
              )}
            >
              {nav.recipes}
              <span
                className={joinClasses(
                  "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-uae-warm-gold/90 transition-all duration-500",
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
                premiumActive ? "text-uae-warm-gold" : "text-stone-400 hover:text-uae-warm-gold/90",
                dsFocus.ring,
              )}
            >
              {nav.pricing}
              <span
                className={joinClasses(
                  "absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-uae-warm-gold/90 transition-all duration-500",
                  dsMotion.easing,
                  premiumActive
                    ? "w-full opacity-100"
                    : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60",
                )}
                aria-hidden
              />
            </Link>
          </div>
        </div>

        <div className=" flex items-center gap-2 sm:gap-3">
          <div className="pointer-events-auto hidden items-center gap-3 lg:flex">
            {notificationsSlot}
            <LanguageSwitcher
              currentLocale={locale}
              switchLanguageAria={nav.switchLanguageAria}
              languageAriaLabel={nav.languageAriaLabel}
            />
            <TextLink
              href={isAuthenticated ? "/account" : "/login"}
              variant={isAuthenticated ? "navActive" : "nav"}
              className="min-h-11 items-center px-2"
            >
              {isAuthenticated ? nav.account : nav.login}
            </TextLink>
          </div>

          <button
            ref={menuButtonRef}
            id="mobile-menu-button"
            type="button"
            data-mobile-nav-trigger
            aria-label={nav.openMenu}
            aria-expanded={open}
            onTouchStart={() => console.log("[Hamburger] react touchstart")}
            onPointerDown={() => console.log("[Hamburger] react pointerdown")}
            onMouseDown={() => console.log("[Hamburger] react mousedown")}
            onClick={() => {
              console.log("React onClick");

              setOpen((prev) => {
                console.log("previous state =", prev);
                return !prev;
              });
            }}
            style={{
              position: "relative",
              zIndex: 999999,
              pointerEvents: "auto",
            }}
            className={joinClasses(
              "flex h-11 w-11 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-white/[0.1] bg-uae-dark-coffee-deep text-stone-300 touch-manipulation lg:hidden",
              "[-webkit-tap-highlight-color:transparent] [touch-action:manipulation]",
              dsMotion.transition,
              "hover:border-uae-warm-gold/35 hover:text-uae-pearl active:scale-[0.98]",
              dsFocus.ring,
            )}
          >
            <Menu className="pointer-events-none h-5 w-5" aria-hidden />
          </button>
        </div>
      </nav>
    </header>

      <MobileNavDrawer
        open={open}
        onClose={handleClose}
        nav={nav}
        locale={locale}
        discoverLinks={discoverLinks}
        isAuthenticated={isAuthenticated}
        notificationsSlot={notificationsSlot}
      />
    </>
  );
}
