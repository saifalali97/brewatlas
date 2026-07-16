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
      <div className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          onError={() => setUseFallback(true)}
          className="object-cover object-[center_30%] opacity-50 brightness-[0.7] saturate-[0.82]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ba-espresso/40 via-ba-espresso/75 to-ba-espresso" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_20%,rgba(184,149,107,0.16),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28 xl:px-16">
        <div
          className={joinClasses(
            "max-w-4xl motion-safe:transition-all motion-safe:duration-1000 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
            mounted ? "motion-safe:translate-y-0 motion-safe:opacity-100" : "motion-safe:translate-y-8 motion-safe:opacity-0",
          )}
        >
          <p className={dsTypography.eyebrowDark}>{t("homeHero.eyebrow")}</p>

          <h1
            id="hero-heading"
            className="font-display mt-8 text-[3.25rem] leading-[0.98] tracking-[-0.04em] text-ba-pearl sm:text-[4.5rem] lg:text-[6.5rem] xl:text-[7.25rem]"
          >
            {t("homeHero.headline")}
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-[1.75] text-ba-sand-deep/90 sm:text-xl">
            {t("homeHero.subtitle")}
          </p>

          <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center">
            <RippleLink href="/recipes" className={`${buttons.primaryLight} w-full sm:w-auto`}>
              {t("homeHero.exploreRecipes")}
            </RippleLink>
            <TextLink
              href="/premium"
              variant="navOnDark"
              className="justify-center text-base sm:justify-start"
            >
              {t("homeHero.viewPremium")} →
            </TextLink>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          role="search"
          aria-label={t("homeHero.searchFormAriaLabel")}
          className={joinClasses(
            "mt-16 max-w-md motion-safe:transition-all motion-safe:duration-1000 motion-safe:delay-150",
            mounted ? "motion-safe:opacity-100" : "motion-safe:opacity-0",
          )}
        >
          <label className="sr-only" htmlFor="hero-search">
            {t("homeHero.searchInputAriaLabel")}
          </label>
          <div className="flex items-center gap-3 border-b border-white/[0.15] pb-3 transition-colors duration-300 focus-within:border-ba-gold/50">
            <Search className="h-4 w-4 shrink-0 text-ba-sand-deep/60" aria-hidden />
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("homeHero.searchPlaceholder")}
              className={joinClasses(
                "w-full bg-transparent py-1 text-sm text-ba-pearl outline-none placeholder:text-ba-sand-deep/45",
                dsFocus.ringDark,
              )}
            />
          </div>
        </form>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ba-pearl to-transparent"
      />
    </section>
  );
}
