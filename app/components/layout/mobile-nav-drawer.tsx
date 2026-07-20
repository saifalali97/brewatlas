"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { LanguageSwitcher } from "@/app/components/layout/language-switcher";
import { TextLink } from "@/app/components/ui/text-link";
import { dsFocus, dsMotion } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";

type DiscoverLink = { href: string; label: string };

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  nav: Dictionary["nav"];
  locale: Locale;
  discoverLinks: DiscoverLink[];
  isAuthenticated: boolean;
  isAdmin?: boolean;
  notificationsSlot?: ReactNode;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function drawerLinkClass(isActive: boolean) {
  return joinClasses(
    "flex min-h-11 items-center rounded-lg px-3 py-2 text-lg font-medium touch-manipulation transition-all duration-300 active:scale-[0.98]",
    isActive
      ? "bg-ba-gold/15 text-ba-espresso border-s-2 border-ac-copper ps-[calc(0.75rem-2px)]"
      : "text-ac-espresso hover:bg-ba-sand/40 hover:text-ba-espresso",
    dsFocus.ring,
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Full-screen mobile navigation drawer — portaled to body for iOS Safari hit-testing. */
export function MobileNavDrawer({
  open,
  onClose,
  nav,
  locale,
  discoverLinks,
  isAuthenticated,
  isAdmin = false,
  notificationsSlot = null,
}: MobileNavDrawerProps) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const backdropTouchRef = useRef(false);
  const openedAtRef = useRef(0);

  useLayoutEffect(() => {
    if (open) {
      openedAtRef.current = Date.now();
    } else {
      openedAtRef.current = 0;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const isWithinOpenGracePeriod = () => {
    if (openedAtRef.current <= 0) return true;
    return Date.now() - openedAtRef.current < 500;
  };

  const handleBackdropTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    if (isWithinOpenGracePeriod()) return;

    event.stopPropagation();
    backdropTouchRef.current = true;
    onClose();
    window.setTimeout(() => {
      backdropTouchRef.current = false;
    }, 400);
  };

  const handleBackdropClick = () => {
    if (isWithinOpenGracePeriod()) return;
    if (backdropTouchRef.current) return;
    onClose();
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      id="mobile-nav-drawer"
      className="fixed inset-0 z-[200] touch-manipulation lg:hidden"
      role="presentation"
    >
      <button
        type="button"
        aria-label={nav.closeMenu}
        className="absolute inset-0 z-0 cursor-pointer bg-ba-espresso/60 backdrop-blur-sm touch-manipulation"
        onTouchEnd={handleBackdropTouchEnd}
        onClick={handleBackdropClick}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={nav.mobileMenuAriaLabel}
        className={joinClasses(
          "pointer-events-auto absolute inset-y-0 end-0 z-[1] flex w-full max-w-sm flex-col",
          "border-s border-ba-espresso/[0.08] bg-ba-pearl",
          "max-lg:pt-[env(safe-area-inset-top,0px)] max-lg:pb-[env(safe-area-inset-bottom,0px)]",
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between border-b border-ba-espresso/[0.06] px-6">
          <span className="font-display text-lg tracking-[-0.02em] text-ba-espresso">BrewAtlas</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={nav.closeMenu}
            className={joinClasses(
              "flex h-11 w-11 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-ba-espresso/10 bg-ba-sand/40 text-ac-espresso touch-manipulation",
              "[touch-action:manipulation]",
              dsMotion.transition,
              "hover:border-ba-bronze/35 hover:text-ba-espresso",
              dsFocus.ring,
            )}
          >
            <X className="pointer-events-none h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav aria-label={nav.mainNavigationAriaLabel} className="flex-1 overflow-y-auto px-6 py-8">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ac-espresso">
            {nav.discover}
          </p>
          <ul className="mt-4 space-y-1">
            {discoverLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActivePath(pathname, link.href) ? "page" : undefined}
                  className={drawerLinkClass(isActivePath(pathname, link.href))}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-8 h-px bg-ba-espresso/[0.06]" aria-hidden />

          <ul className="space-y-1">
            <li>
              <Link
                href="/recipes"
                onClick={onClose}
                aria-current={isActivePath(pathname, "/recipes") ? "page" : undefined}
                className={drawerLinkClass(isActivePath(pathname, "/recipes"))}
              >
                {nav.recipes}
              </Link>
            </li>
            <li>
              <Link
                href="/premium"
                onClick={onClose}
                aria-current={isActivePath(pathname, "/premium") ? "page" : undefined}
                className={drawerLinkClass(isActivePath(pathname, "/premium"))}
              >
                {nav.pricing}
              </Link>
            </li>
            {isAdmin ? (
              <li>
                <Link
                  href="/admin"
                  onClick={onClose}
                  aria-current={isActivePath(pathname, "/admin") ? "page" : undefined}
                  className={drawerLinkClass(isActivePath(pathname, "/admin"))}
                >
                  {nav.admin}
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <div className="space-y-5 border-t border-ba-espresso/[0.06] px-6 py-6">
          {notificationsSlot ? <div className="flex items-center gap-3">{notificationsSlot}</div> : null}

          <LanguageSwitcher
            currentLocale={locale}
            switchLanguageAria={nav.switchLanguageAria}
            languageAriaLabel={nav.languageAriaLabel}
            size="large"
          />

          <TextLink
            href={isAuthenticated ? "/account" : "/login"}
            variant="default"
            className="flex min-h-11 items-center text-base font-medium touch-manipulation"
            onClick={onClose}
          >
            {isAuthenticated ? nav.account : nav.login}
          </TextLink>
        </div>
      </div>
    </div>,
    document.body,
  );
}
