"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode, type TouchEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { LanguageSwitcher } from "@/app/components/layout/language-switcher";
import { logMobileNav } from "@/app/components/layout/mobile-nav-debug";
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
  notificationsSlot?: ReactNode;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Full-screen mobile navigation drawer — portaled to body for iOS Safari hit-testing. */
export function MobileNavDrawer({
  open,
  onClose,
  nav,
  locale,
  discoverLinks,
  isAuthenticated,
  notificationsSlot = null,
}: MobileNavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const backdropTouchRef = useRef(false);
  const openedAtRef = useRef(0);
  const prevOpenRef = useRef(false);

  // Set grace-period timestamp synchronously when open flips false→true.
  // useLayoutEffect runs too late: iOS ghost-click on the backdrop can fire
  // before openedAtRef is set, and `Date.now() - 0` fails the grace check.
  if (open && !prevOpenRef.current) {
    openedAtRef.current = Date.now();
    console.log("MobileNavDrawer open transition false→true, openedAt set", openedAtRef.current);
  }
  if (!open && prevOpenRef.current) {
    openedAtRef.current = 0;
    console.log("MobileNavDrawer open transition true→false, openedAt reset");
  }
  prevOpenRef.current = open;

  console.log("drawer prop", open);

  useLayoutEffect(() => {
    if (open) {
      openedAtRef.current = Date.now();
    }
  }, [open]);

  useEffect(() => {
    logMobileNav("MobileNavDrawer render cycle", {
      open,
      hasDocument: typeof document !== "undefined",
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    logMobileNav("MobileNavDrawer mounted in DOM (portal)");

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
    const elapsed = Date.now() - openedAtRef.current;
    const within = openedAtRef.current > 0 && elapsed < 500;
    console.log("isWithinOpenGracePeriod", { openedAt: openedAtRef.current, elapsed, within });
    return within;
  };

  const handleBackdropTouchEnd = (event: TouchEvent<HTMLButtonElement>) => {
    console.log("handleBackdropTouchEnd", { open, openedAt: openedAtRef.current });
    if (isWithinOpenGracePeriod()) {
      console.log("handleBackdropTouchEnd blocked by grace period");
      return;
    }

    event.stopPropagation();
    backdropTouchRef.current = true;
    logMobileNav("drawer backdrop touchend");
    console.log("handleBackdropTouchEnd calling onClose");
    onClose();
    window.setTimeout(() => {
      backdropTouchRef.current = false;
    }, 400);
  };

  const handleBackdropClick = () => {
    console.log("handleBackdropClick", { open, openedAt: openedAtRef.current, backdropTouch: backdropTouchRef.current });
    if (isWithinOpenGracePeriod()) {
      console.log("handleBackdropClick blocked by grace period");
      return;
    }
    if (backdropTouchRef.current) {
      console.log("handleBackdropClick blocked by backdropTouchRef");
      return;
    }
    logMobileNav("drawer backdrop click");
    console.log("handleBackdropClick calling onClose");
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
        className="absolute inset-0 z-0 cursor-pointer bg-uae-dark-coffee-deep/80 touch-manipulation"
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
          "border-s border-white/[0.08] bg-uae-dark-coffee",
          "max-lg:pt-[env(safe-area-inset-top,0px)] max-lg:pb-[env(safe-area-inset-bottom,0px)]",
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between border-b border-white/[0.06] px-6">
          <span className="text-lg font-semibold tracking-tight text-uae-pearl">BrewAtlas</span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => {
              logMobileNav("drawer close button click");
              onClose();
            }}
            aria-label={nav.closeMenu}
            className={joinClasses(
              "flex h-11 w-11 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] text-stone-400 touch-manipulation",
              "[touch-action:manipulation]",
              dsMotion.transition,
              "hover:border-uae-warm-gold/35 hover:text-uae-pearl",
              dsFocus.ring,
            )}
          >
            <X className="pointer-events-none h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav aria-label={nav.mainNavigationAriaLabel} className="flex-1 overflow-y-auto px-6 py-8">
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stone-500">
            {nav.discover}
          </p>
          <ul className="mt-4 space-y-1">
            {discoverLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={joinClasses(
                    "flex min-h-11 items-center py-2 text-lg font-medium text-stone-300 touch-manipulation",
                    dsMotion.transition,
                    "hover:text-uae-pearl",
                    dsFocus.ring,
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-8 h-px bg-white/[0.06]" aria-hidden />

          <ul className="space-y-1">
            <li>
              <Link
                href="/recipes"
                onClick={onClose}
                className={joinClasses(
                  "flex min-h-11 items-center py-2 text-lg font-medium text-uae-pearl touch-manipulation",
                  dsFocus.ring,
                )}
              >
                {nav.recipes}
              </Link>
            </li>
            <li>
              <Link
                href="/premium"
                onClick={onClose}
                className={joinClasses(
                  "flex min-h-11 items-center py-2 text-lg font-medium text-uae-warm-gold touch-manipulation",
                  dsFocus.ring,
                )}
              >
                {nav.pricing}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-5 border-t border-white/[0.06] px-6 py-6">
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
