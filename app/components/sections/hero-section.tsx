"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { TextLink } from "@/app/components/ui/text-link";
import { buttons, dsFocus, dsTypography, sectionPadding } from "@/lib/constants/styles";
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

export function HeroSection({ heroImage }: HeroSectionProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const src = useFallback ? HERO_FALLBACK_IMAGE : heroImage || HERO_FALLBACK_IMAGE;

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
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="section-espresso-gradient hero-grain relative min-h-[100svh] overflow-hidden"
    >
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          onError={() => setUseFallback(true)}
          className="object-cover object-center opacity-40 brightness-[0.65] saturate-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ba-espresso via-ba-espresso/85 to-ba-espresso/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(184,149,107,0.12),transparent_55%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ba-espresso to-transparent" />
      </div>

      <div
        className={joinClasses(
          "relative mx-auto flex min-h-[calc(100svh-var(--ds-header-height))] max-w-7xl flex-col justify-center",
          sectionPadding.hero,
        )}
      >
        <div
          className={joinClasses(
            "max-w-3xl motion-safe:transition-all motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
            mounted ? "motion-safe:translate-y-0 motion-safe:opacity-100" : "motion-safe:translate-y-6 motion-safe:opacity-0",
          )}
        >
          <p className={dsTypography.eyebrowDark}>{t("homeHero.eyebrow")}</p>

          <h1 id="hero-heading" className={`mt-6 ${dsTypography.displayDark}`}>
            {t("homeHero.headline")}
          </h1>

          <p className={`mt-8 max-w-lg ${dsTypography.bodyDark}`}>{t("homeHero.subtitle")}</p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
            <RippleLink href="/recipes" className={`${buttons.primaryLight} w-full sm:w-auto`}>
              {t("homeHero.exploreRecipes")}
            </RippleLink>
            <TextLink href="/premium" variant="accent" className="justify-center px-2 text-base text-ba-gold sm:justify-start">
              {t("homeHero.viewPremium")} →
            </TextLink>
          </div>

          <form
            onSubmit={handleSearch}
            role="search"
            aria-label={t("homeHero.searchFormAriaLabel")}
            className="mt-12 max-w-lg"
          >
            <label className="sr-only" htmlFor="hero-search">
              {t("homeHero.searchInputAriaLabel")}
            </label>
            <div className="flex items-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.06] px-5 py-3 backdrop-blur-xl transition-colors duration-300 focus-within:border-ba-gold/35 focus-within:bg-white/[0.1]">
              <Search className="h-4 w-4 shrink-0 text-ba-sand-deep/70" aria-hidden />
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("homeHero.searchPlaceholder")}
                className={joinClasses(
                  "w-full bg-transparent py-1 text-sm text-ba-pearl outline-none placeholder:text-ba-sand-deep/50",
                  dsFocus.ringDark,
                )}
              />
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
