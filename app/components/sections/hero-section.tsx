"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { TextLink } from "@/app/components/ui/text-link";
import { buttons, dsFocus, dsTypography } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";

const HERO_FALLBACK_IMAGE = "/images/recipes/espresso-shot.png";

function shouldShowHeroImmediately() {
  if (typeof window === "undefined") return false;

  const isMobile = window.matchMedia("(max-width: 1023px)").matches;
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return isMobile || isIos;
}

type HeroSectionProps = {
  heroImage: string;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function HeroVisual({ image, alt }: { image: string; alt: string }) {
  const [useFallback, setUseFallback] = useState(false);
  const src = useFallback ? HERO_FALLBACK_IMAGE : image || HERO_FALLBACK_IMAGE;

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/[0.08] shadow-[0_32px_80px_-32px_rgba(0,0,0,0.65)] lg:max-w-none lg:justify-self-end">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        onError={() => setUseFallback(true)}
        className="object-cover object-center brightness-[0.92] contrast-[1.03] saturate-[0.94]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-uae-dark-coffee-deep/50 via-transparent to-uae-dark-coffee-deep/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(192,138,46,0.12),transparent_55%)]"
      />
    </div>
  );
}

export function HeroSection({ heroImage }: HeroSectionProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (shouldShowHeroImmediately()) return;

    const frame = requestAnimationFrame(() => setMounted(true));
    const fallback = window.setTimeout(() => setMounted(true), 200);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="hero-grain relative overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-28 sm:px-8 lg:grid lg:min-h-[calc(100svh-var(--ds-header-height))] lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-12 lg:pb-24 lg:pt-32">
        <div
          className={joinClasses(
            "max-w-xl max-lg:translate-y-0 max-lg:opacity-100 motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
            mounted ? "motion-safe:translate-y-0 motion-safe:opacity-100" : "motion-safe:translate-y-4 motion-safe:opacity-0",
          )}
        >
          <p className={dsTypography.eyebrow}>{t("homeHero.eyebrow")}</p>

          <h1
            id="hero-heading"
            className="mt-5 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] text-uae-pearl sm:text-6xl lg:text-[4.25rem]"
          >
            {t("homeHero.headline")}
          </h1>

          <p className="mt-6 max-w-md text-lg leading-[1.65] text-stone-400">
            {t("homeHero.subtitle")}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <RippleLink href="/recipes" className={`${buttons.primary} w-full sm:w-auto`}>
              {t("homeHero.exploreRecipes")}
            </RippleLink>
            <TextLink href="/premium" variant="accent" className="justify-center px-2 text-base sm:justify-start">
              {t("homeHero.viewPremium")} →
            </TextLink>
          </div>

          <form
            onSubmit={handleSearch}
            role="search"
            aria-label={t("homeHero.searchFormAriaLabel")}
            className="mt-10 max-w-md"
          >
            <label className="sr-only" htmlFor="hero-search">
              {t("homeHero.searchInputAriaLabel")}
            </label>
            <div className="flex items-center gap-3 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 backdrop-blur-xl transition-colors duration-300 focus-within:border-uae-warm-gold/35 focus-within:bg-white/[0.05]">
              <Search className="h-4 w-4 shrink-0 text-stone-500" aria-hidden />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("homeHero.searchPlaceholder")}
                className={joinClasses(
                  "w-full bg-transparent py-1.5 text-sm text-uae-pearl outline-none placeholder:text-stone-500",
                  dsFocus.ring,
                )}
              />
            </div>
          </form>
        </div>

        <div
          className={joinClasses(
            "relative mt-14 max-lg:translate-y-0 max-lg:opacity-100 lg:mt-0 motion-safe:transition-all motion-safe:duration-700 motion-safe:delay-100 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
            mounted ? "motion-safe:translate-y-0 motion-safe:opacity-100" : "motion-safe:translate-y-6 motion-safe:opacity-0",
          )}
        >
          <HeroVisual key={heroImage} image={heroImage} alt={t("homeHero.heroImageAlt")} />
        </div>
      </div>
    </section>
  );
}
