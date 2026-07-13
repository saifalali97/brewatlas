"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/app/components/layout/language-switcher";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import type { Locale } from "@/types/i18n";

/** Falls back to English labels when no dictionary is supplied, so this component still renders standalone. */
const defaultNavLabels: Dictionary["nav"] = {
  home: "Home",
  recipes: "Recipes",
  methods: "Methods",
  origins: "Origins",
  roasters: "Roasters",
  devices: "Devices",
  culture: "Culture",
  pricing: "Pricing",
  faq: "FAQ",
  dashboard: "Dashboard",
  community: "Community",
  profile: "Profile",
  settings: "Settings",
  joinPremium: "Join Premium",
  login: "Log in",
  signup: "Sign up",
  logout: "Log out",
  skipToMainContent: "Skip to main content",
};

export function SiteNav({ nav = defaultNavLabels, locale = DEFAULT_LOCALE }: { nav?: Dictionary["nav"]; locale?: Locale }) {
  const navLinks = [
    { href: "/recipes", label: nav.recipes, id: "recipes" },
    { href: "/methods", label: nav.methods, id: "methods" },
    { href: "/origins", label: nav.origins, id: "origins" },
    { href: "/roasters", label: nav.roasters, id: "roasters" },
    { href: "/premium", label: nav.pricing, id: "pricing" },
    { href: "/#faq", label: nav.faq, id: "faq" },
  ];

  const [activeId, setActiveId] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.45, 0.7] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ease-out backdrop-blur-2xl backdrop-saturate-150 ${
        scrolled
          ? "border-white/[0.06] bg-[#0a0705]/92 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)]"
          : "border-white/[0.04] bg-[#0a0705]/70"
      }`}
    >
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 md:py-4 lg:px-8 lg:py-5">
        <Link
          href="/"
          aria-label="BrewAtlas home"
          className="text-lg font-semibold tracking-tight text-stone-50 transition-opacity duration-300 hover:opacity-80"
        >
          BrewAtlas
        </Link>
        <div className="hidden items-center gap-7 text-sm lg:flex xl:gap-9">
          {navLinks.map((link) => {
            const isActive = activeId === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative px-0.5 py-1.5 transition-colors duration-300 ${
                  isActive ? "text-stone-100" : "text-stone-400 hover:text-stone-100"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-1/2 h-px -translate-x-1/2 bg-amber-500/90 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    isActive
                      ? "w-full opacity-100"
                      : "w-0 opacity-0 group-hover:w-full group-hover:opacity-60"
                  }`}
                />
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <RippleLink
            href="/premium"
            aria-label="Join BrewAtlas Premium"
            className="rounded-full bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-[1.04] hover:bg-amber-500 hover:shadow-[0_0_36px_rgba(217,119,6,0.42)] active:scale-[0.97] sm:px-5"
          >
            {nav.joinPremium}
          </RippleLink>
        </div>
      </nav>
    </header>
  );
}
