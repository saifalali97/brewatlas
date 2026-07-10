"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#recipes", label: "Recipes", id: "recipes" },
  { href: "#methods", label: "Methods", id: "methods" },
  { href: "#origins", label: "Origins", id: "origins" },
  { href: "#roasters", label: "Roasters", id: "roasters" },
  { href: "#pricing", label: "Pricing", id: "pricing" },
  { href: "#faq", label: "FAQ", id: "faq" },
];

export function SiteNav() {
  const [activeId, setActiveId] = useState<string>("");

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
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-[#0a0705]/75 backdrop-blur-2xl backdrop-saturate-150">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8 lg:py-5">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-stone-50 transition-opacity duration-300 hover:opacity-80"
        >
          BrewAtlas
        </Link>
        <div className="hidden items-center gap-8 text-sm lg:flex xl:gap-9">
          {navLinks.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                className={`group relative py-1 transition-colors duration-300 ${
                  isActive ? "text-stone-100" : "text-stone-400 hover:text-stone-100"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-amber-500/90 transition-all duration-300 ease-out ${
                    isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-70"
                  }`}
                />
              </a>
            );
          })}
        </div>
        <Link
          href="#pricing"
          className="rounded-full bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-[1.03] hover:bg-amber-500 hover:shadow-[0_0_28px_rgba(217,119,6,0.35)] active:scale-[0.98] sm:px-5"
        >
          Join Premium
        </Link>
      </nav>
    </header>
  );
}
