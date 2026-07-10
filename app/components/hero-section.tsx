"use client";

import { useState } from "react";
import { AnimatedStat } from "./animated-stat";
import { PremiumImage } from "./premium-image";
import { RevealOnScroll } from "./reveal-on-scroll";
import { RippleLink } from "./ripple-link";

const popularTags = [
  "Pour Over",
  "Espresso",
  "Cold Brew",
  "Ethiopian",
  "V60",
  "Chemex",
];

type HeroSectionProps = {
  heroImage: string;
  cupImage: string;
  heroStats: { label: string; value: string }[];
  eyebrow: string;
  btnPrimary: string;
  btnSecondary: string;
};

function CoffeeCupVisual({ cupImage }: { cupImage: string }) {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Orange ambient glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/3 rounded-full bg-amber-600/20 blur-[80px]"
      />
      <div
        aria-hidden
        className="absolute right-0 top-1/4 h-40 w-40 rounded-full bg-orange-500/10 blur-[60px]"
      />

      {/* Floating beans */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="animate-bean-float absolute left-[8%] top-[18%] text-amber-700/50" style={{ animationDelay: "0s" }}>
          <CoffeeBeanIcon className="h-5 w-5 rotate-[-25deg]" />
        </span>
        <span className="animate-bean-float absolute right-[12%] top-[28%] text-amber-600/40" style={{ animationDelay: "1.2s" }}>
          <CoffeeBeanIcon className="h-4 w-4 rotate-[35deg]" />
        </span>
        <span className="animate-bean-float absolute bottom-[30%] left-[15%] text-amber-800/35" style={{ animationDelay: "2.4s" }}>
          <CoffeeBeanIcon className="h-3.5 w-3.5 rotate-[15deg]" />
        </span>
        <span className="animate-bean-float absolute bottom-[22%] right-[8%] text-amber-600/45" style={{ animationDelay: "0.8s" }}>
          <CoffeeBeanIcon className="h-5 w-5 rotate-[-40deg]" />
        </span>
        <span className="animate-bean-float absolute right-[28%] top-[8%] text-amber-700/30" style={{ animationDelay: "1.8s" }}>
          <CoffeeBeanIcon className="h-3 w-3 rotate-[50deg]" />
        </span>
      </div>

      {/* Glass frame */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-white/[0.04] p-3 shadow-[0_40px_80px_-32px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.06]">
          <PremiumImage
            src={cupImage}
            alt="Premium specialty coffee in a ceramic cup"
            overlay="banner"
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="aspect-[4/5] w-full sm:aspect-[5/6]"
          />

          {/* Steam */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-4 pt-6"
          >
            <span className="animate-steam h-16 w-3 rounded-full bg-gradient-to-t from-white/0 via-white/10 to-white/25 blur-[1px]" style={{ animationDelay: "0s" }} />
            <span className="animate-steam h-20 w-2.5 rounded-full bg-gradient-to-t from-white/0 via-white/8 to-white/20 blur-[1px]" style={{ animationDelay: "0.6s" }} />
            <span className="animate-steam h-14 w-2 rounded-full bg-gradient-to-t from-white/0 via-white/10 to-white/22 blur-[1px]" style={{ animationDelay: "1.2s" }} />
          </div>

          {/* Cup rim highlight */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0705]/80 via-[#0a0705]/20 to-transparent"
          />
        </div>

        {/* Glass badge */}
        <div className="absolute bottom-6 left-6 rounded-full border border-amber-700/30 bg-[#0a0705]/60 px-3.5 py-1.5 text-xs font-medium text-amber-400/90 backdrop-blur-md">
          Single Origin · Light Roast
        </div>
      </div>
    </div>
  );
}

function CoffeeBeanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.5 2 6 4.8 6 8.5c0 2.2 1 4.2 2.6 5.5C7.2 15.5 6 17.8 6 20.5 6 21.3 6.7 22 7.5 22h9c.8 0 1.5-.7 1.5-1.5 0-2.7-1.2-5-2.6-6.5C17 12.7 18 10.7 18 8.5 18 4.8 15.5 2 12 2zm0 2c2.2 0 4 1.8 4 4.5 0 1.5-.7 2.9-1.8 3.8l-.5.4.3.6c1 1.8 1.7 3.7 1.9 5.7h-7.8c.2-2 0.9-3.9 1.9-5.7l.3-.6-.5-.4C8.7 11.4 8 10 8 8.5 8 5.8 9.8 4 12 4z" />
    </svg>
  );
}

export function HeroSection({
  heroImage,
  cupImage,
  heroStats,
  eyebrow,
  btnPrimary,
  btnSecondary,
}: HeroSectionProps) {
  const [query, setQuery] = useState("");

  const scrollToRecipes = () => {
    document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    scrollToRecipes();
  };

  const applyTag = (tag: string) => {
    setQuery(tag);
    scrollToRecipes();
  };

  return (
    <section className="relative overflow-hidden px-5 pb-32 pt-24 sm:px-6 md:px-7 md:pb-36 md:pt-28 lg:px-8 lg:pb-40 lg:pt-36">
      {/* Cinematic background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <PremiumImage
          src={heroImage}
          alt=""
          overlay="hero"
          priority
          sizes="100vw"
          className="h-full w-full opacity-40"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(217,119,6,0.18),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_60%,rgba(180,120,60,0.12),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0705] via-[#0a0705]/85 to-[#0a0705]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0705]/50 via-transparent to-[#0a0705]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 xl:gap-20">
          {/* Copy + search */}
          <RevealOnScroll>
            <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-left">
              <p className={`mb-8 ${eyebrow}`}>Specialty Coffee, Perfected</p>
              <h1 className="bg-gradient-to-b from-stone-50 to-stone-400 bg-clip-text text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] text-transparent sm:text-6xl lg:text-[4.5rem]">
                BrewAtlas
              </h1>
              <p className="mx-auto mt-8 max-w-xl text-lg leading-[1.8] text-stone-400 sm:text-xl sm:leading-[1.75] lg:mx-0">
                The world&apos;s largest specialty coffee recipe platform.
              </p>

              {/* Search */}
              <form
                onSubmit={handleSearch}
                className="mx-auto mt-10 max-w-xl lg:mx-0"
              >
                <div className="group relative rounded-2xl border border-white/[0.1] bg-white/[0.05] p-1.5 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300 focus-within:border-amber-700/35 focus-within:bg-white/[0.07] focus-within:shadow-[0_20px_56px_-16px_rgba(217,119,6,0.15)]">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-3 px-4">
                      <svg
                        className="h-5 w-5 shrink-0 text-stone-500 transition-colors duration-300 group-focus-within:text-amber-500/80"
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
                        placeholder="Search recipes, origins, methods..."
                        className="w-full bg-transparent py-3.5 text-sm text-stone-100 placeholder:text-stone-500 outline-none"
                        aria-label="Search recipes"
                      />
                    </div>
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-amber-600 px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-amber-500 hover:shadow-[0_0_28px_rgba(217,119,6,0.35)] active:scale-[0.98]"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>

              {/* Popular tags */}
              <div className="mx-auto mt-5 max-w-xl lg:mx-0">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-stone-500">
                  Popular searches
                </p>
                <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => applyTag(tag)}
                      className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs text-stone-400 backdrop-blur-md transition-all duration-300 hover:border-amber-700/30 hover:bg-amber-950/30 hover:text-amber-200/90"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="mx-auto mt-10 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-center lg:mx-0">
                <RippleLink href="#recipes" className={`${btnPrimary} w-full sm:w-auto`}>
                  Explore Recipes
                </RippleLink>
                <RippleLink href="#pricing" className={`${btnSecondary} w-full sm:w-auto`}>
                  Join Premium
                </RippleLink>
              </div>
            </div>
          </RevealOnScroll>

          {/* Cup visual */}
          <RevealOnScroll delay={120}>
            <CoffeeCupVisual cupImage={cupImage} />
          </RevealOnScroll>
        </div>

        {/* Stats glass panel */}
        <RevealOnScroll delay={160} className="relative mx-auto mt-28 max-w-4xl md:mt-32">
          <div className="absolute -inset-4 rounded-[1.75rem] bg-gradient-to-r from-amber-900/25 via-amber-700/12 to-stone-800/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-10 shadow-[0_36px_72px_-28px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-12 md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.08),transparent_60%)]"
            />
            <div className="relative grid gap-10 sm:grid-cols-3 sm:gap-8">
              {heroStats.map((stat) => (
                <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
