"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatedStat } from "@/app/components/ui/animated-stat";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { DictionaryKey } from "@/lib/i18n/types";

const HERO_VISUAL_IMAGE =
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=2000&q=90";

const quickFilters = [
  {
    label: "V60",
    labelKey: "homeFilters.v60" as DictionaryKey,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <path d="M8 2L3 7h10L8 2z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M5 7v3c0 2.2 1.4 4.2 3 5 1.6-.8 3-2.8 3-5V7" stroke="currentColor" strokeWidth="1.25" />
      </svg>
    ),
  },
  {
    label: "Espresso",
    labelKey: "homeFilters.espresso" as DictionaryKey,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <rect x="3" y="5" width="10" height="7" rx="1.25" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.25" />
        <path d="M6.5 12v1.5M9.5 12v1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Chemex",
    labelKey: "homeFilters.chemex" as DictionaryKey,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <path d="M5 3h6l1.5 10H3.5L5 3z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M6 6.5h4M6 9h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Aeropress",
    labelKey: "homeFilters.aeropress" as DictionaryKey,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <rect x="5.5" y="2.5" width="5" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
        <path d="M5.5 7h5M5.5 9.5h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Cold Brew",
    labelKey: "homeFilters.coldBrew" as DictionaryKey,
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
        <path d="M5 3.5h6l1 9.5H4l1-9.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
        <circle cx="11.5" cy="5" r="1" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
];

const heroStats = [
  {
    labelKey: "homeHero.statRecipesLabel" as DictionaryKey,
    value: "12,400+",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
        <path
          d="M8 4h8a2 2 0 012 2v14l-6-3-6 3V6a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    labelKey: "homeHero.statRoastersLabel" as DictionaryKey,
    value: "840+",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
        <path
          d="M12 3c3.5 0 6 2.5 6 6 0 2.2-1 4.2-2.6 5.5C17.2 16.5 18 18.8 18 21.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 3C8.5 3 6 5.5 6 9c0 2.2 1 4.2 2.6 5.5C7.2 16.5 6 18.8 6 21.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path d="M9 21.5h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    labelKey: "homeHero.statCountriesLabel" as DictionaryKey,
    value: "62",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-[18px] w-[18px]" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M3 12h18M12 3c2.5 2.8 4 6.2 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6.2-4 9s1.5 6.2 4 9"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

type HeroSectionProps = {
  heroImage: string;
  btnPrimary: string;
  btnSecondary: string;
};

function HeroCoffeeVisual({
  fallbackImage,
  featuredRecipeLabel,
  imageAlt,
}: {
  fallbackImage: string;
  featuredRecipeLabel: string;
  imageAlt: string;
}) {
  const [imageSrc, setImageSrc] = useState(HERO_VISUAL_IMAGE);
  const isFallback = imageSrc.startsWith("/");

  return (
    <div className="relative flex h-full min-h-[540px] items-center justify-end">
      <div
        aria-hidden
        className="absolute right-[8%] top-[48%] h-[460px] w-[460px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.32)_0%,rgba(180,120,60,0.12)_38%,transparent_72%)] blur-[72px]"
      />
      <div
        aria-hidden
        className="absolute right-[20%] top-[42%] h-[280px] w-[280px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.14)_0%,transparent_70%)] blur-3xl"
      />

      <div className="motion-safe:animate-hero-float relative h-[min(74vh,640px)] w-full max-w-[500px] rounded-[1.25rem] border border-white/[0.11] bg-white/[0.02] p-1 shadow-[0_32px_72px_-28px_rgba(0,0,0,0.62),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-sm">
        <div className="relative h-full w-full overflow-hidden rounded-[1.125rem]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            preload
            sizes="(min-width: 1024px) 44vw, 0px"
            unoptimized={isFallback}
            onError={() => {
              setImageSrc((prev) => {
                if (prev === HERO_VISUAL_IMAGE) return fallbackImage;
                if (prev === fallbackImage) return "/images/coffee-placeholder.svg";
                return prev;
              });
            }}
            className="object-cover object-[center_42%] brightness-[0.98] contrast-[1.03] saturate-[0.96]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-l from-[#0a0705] via-[#0a0705]/20 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#0a0705]/56 via-transparent to-[#0a0705]/16"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_30%,#0a0705_100%)] opacity-40"
          />

          <div className="absolute start-4 top-4 rounded-full border border-amber-700/30 bg-[#0a0705]/55 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-amber-300/90 backdrop-blur-md">
            {featuredRecipeLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection({
  heroImage,
  btnPrimary,
  btnSecondary,
}: HeroSectionProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const scrollToRecipes = () => {
    document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/recipes?q=${encodeURIComponent(trimmed)}`);
      return;
    }
    scrollToRecipes();
  };

  const applyFilter = (filter: string) => {
    setActiveFilter(filter);
    setQuery(filter);
    scrollToRecipes();
  };

  const ctaSecondary = `${btnSecondary} group relative isolate overflow-hidden border-amber-600/25 bg-white/[0.04] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-amber-500/45 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(217,119,6,0.18),0_12px_32px_-16px_rgba(0,0,0,0.35)] active:translate-y-0 active:scale-[0.98]`;

  return (
    <section id="hero" aria-label={t("homeHero.sectionAriaLabel")} className="hero-grain relative min-h-screen h-[100svh] overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#0a0705]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_12%_18%,rgba(217,119,6,0.1),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_88%_32%,rgba(180,120,60,0.09),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(90,50,30,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0705]/50 via-transparent to-[#0a0705]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0705] via-[#0a0705]/92 to-[#0a0705]/35" />
      </div>

      <div className="relative z-10 mx-auto flex h-full min-h-screen max-w-6xl flex-col px-6 pb-28 pt-24 lg:px-8 lg:pb-24 lg:pt-[7.5rem]">
        <div className="grid flex-1 items-center gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 xl:gap-16">
          <div
            className={`max-w-[34rem] motion-safe:transition-all motion-safe:duration-1000 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${
              mounted
                ? "motion-safe:translate-y-0 motion-safe:opacity-100"
                : "motion-safe:translate-y-6 motion-safe:opacity-0"
            }`}
          >
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-amber-500/75">
              {t("homeHero.eyebrow")}
            </p>

            <h1 className="mt-4 text-[3.5rem] font-semibold leading-[0.92] tracking-[-0.045em] sm:text-7xl lg:text-[5.75rem]">
              <span className="block bg-gradient-to-b from-white via-stone-50 to-stone-400 bg-clip-text text-transparent">
                BrewAtlas
              </span>
            </h1>

            <p className="mt-5 max-w-[30rem] text-[1.0625rem] leading-[1.72] text-stone-400/95 lg:mt-6 lg:text-lg lg:leading-[1.68]">
              {t("homeHero.subtitle")}
            </p>

            <form
              onSubmit={handleSearch}
              role="search"
              aria-label={t("homeHero.searchFormAriaLabel")}
              className="mt-10 max-w-[34.5rem] lg:mt-11"
            >
              <div className="group relative rounded-[1.125rem] border border-white/[0.14] bg-white/[0.045] p-1 shadow-[0_28px_72px_-28px_rgba(0,0,0,0.8)] backdrop-blur-3xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/18 focus-within:border-amber-500/30 focus-within:bg-white/[0.065] focus-within:shadow-[0_36px_96px_-28px_rgba(217,119,6,0.28),0_0_48px_rgba(217,119,6,0.08)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[1.125rem] bg-gradient-to-b from-white/[0.09] to-transparent transition-opacity duration-700 group-focus-within:opacity-80"
                />
                <div className="relative flex min-h-[4rem] items-center gap-4 rounded-2xl bg-white/[0.025] px-5">
                  <svg
                    className="h-6 w-6 shrink-0 text-stone-500 transition-colors duration-500 ease-out group-focus-within:text-amber-500/80 group-hover:text-stone-400"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("homeHero.searchPlaceholder")}
                    className="w-full bg-transparent py-4 text-base text-stone-50 placeholder:text-stone-400 outline-none transition-colors duration-500"
                    aria-label={t("homeHero.searchInputAriaLabel")}
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.09] px-5 py-3 text-sm font-medium text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/22 hover:bg-white/[0.14] hover:shadow-[0_0_32px_rgba(255,255,255,0.07)] active:scale-[0.98]"
                  >
                    {t("common.search")}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5 flex max-w-[34.5rem] flex-wrap gap-2.5 lg:mt-6">
              {quickFilters.map((filter) => {
                const filterLabel = t(filter.labelKey);
                return (
                  <button
                    key={filter.label}
                    type="button"
                    aria-label={t("homeFilters.filterByAria", { filter: filterLabel })}
                    aria-pressed={activeFilter === filter.label}
                    onClick={() => applyFilter(filter.label)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[0.8125rem] font-medium backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(217,119,6,0.14)] active:scale-[0.98] ${
                      activeFilter === filter.label
                        ? "border-amber-600/45 bg-amber-950/45 text-amber-100/90 shadow-[0_0_24px_rgba(217,119,6,0.12)]"
                        : "border-white/[0.1] bg-white/[0.035] text-stone-400 hover:border-amber-600/25 hover:bg-white/[0.06] hover:text-stone-200"
                    }`}
                  >
                    <span className={`[&_svg]:h-4 [&_svg]:w-4 ${activeFilter === filter.label ? "text-amber-400/90" : "text-stone-500"}`}>
                      {filter.icon}
                    </span>
                    {filterLabel}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-11">
              <RippleLink href="#recipes" className={`${btnPrimary} w-full sm:w-auto`}>
                {t("homeHero.exploreRecipes")}
              </RippleLink>
              <RippleLink href="/premium" className={`${ctaSecondary} w-full sm:w-auto`}>
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-500/12 to-amber-600/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="relative z-10">{t("homeHero.viewPremium")}</span>
              </RippleLink>
            </div>
          </div>

          <div
            className={`hidden motion-safe:transition-all motion-safe:duration-1000 motion-safe:delay-150 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] lg:block ${
              mounted
                ? "motion-safe:translate-y-0 motion-safe:opacity-100"
                : "motion-safe:translate-y-8 motion-safe:opacity-0"
            }`}
          >
            <HeroCoffeeVisual
              fallbackImage={heroImage}
              featuredRecipeLabel={t("homeHero.featuredRecipeBadge")}
              imageAlt={t("homeHero.heroImageAlt")}
            />
          </div>
        </div>

        <div
          className={`mt-12 lg:mt-8 motion-safe:transition-all motion-safe:duration-1000 motion-safe:delay-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] ${
            mounted
              ? "motion-safe:translate-y-0 motion-safe:opacity-100"
              : "motion-safe:translate-y-6 motion-safe:opacity-0"
          }`}
        >
          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {heroStats.map((stat) => (
              <div
                key={stat.labelKey}
                className="flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-all duration-500 hover:border-white/[0.14] hover:bg-white/[0.05] sm:px-6 sm:py-[1.125rem]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/20 bg-amber-950/25 text-amber-500/80">
                  {stat.icon}
                </div>
                <div className="min-w-0 text-left [&_p:first-child]:text-2xl [&_p:first-child]:sm:text-[1.75rem] [&_p:first-child]:lg:text-[2rem]">
                  <AnimatedStat value={stat.value} label={t(stat.labelKey)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
