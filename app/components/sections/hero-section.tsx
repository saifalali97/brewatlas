"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { TextLink } from "@/app/components/ui/text-link";
import { buttons } from "@/lib/constants/styles";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { useTranslations } from "@/lib/i18n/translation-context";

const HERO_FALLBACK_IMAGE = "/images/recipes/espresso-shot.png";

type HeroSectionProps = {
  heroImage: string;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Chapter 0 — Prologue. Full-viewport cinematic arrival. */
export function HeroSection({ heroImage }: HeroSectionProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [useFallback, setUseFallback] = useState(false);
  const src = useFallback ? HERO_FALLBACK_IMAGE : heroImage || HERO_FALLBACK_IMAGE;

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <section
      id="prologue"
      aria-labelledby="hero-heading"
      className="ac-section-night hero-grain relative min-h-[100svh] overflow-hidden"
    >
      <div className="absolute inset-0">
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          onError={() => setUseFallback(true)}
          className="photo-grade-night object-cover object-[center_30%] opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ac-espresso/40 via-ac-espresso/75 to-ac-espresso" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_20%,rgba(196,165,116,0.14),transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 sm:px-8 sm:pb-24 lg:px-12 lg:pb-28 xl:px-16">
        <div className="max-w-4xl motion-safe:animate-[ac-reveal-up_1200ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none">
          <p className={acTypography.eyebrowDark}>{t("homeHero.eyebrow")}</p>

          <h1
            id="hero-heading"
            className="font-display mt-8 text-[3.25rem] leading-[0.98] tracking-[-0.04em] text-ac-pearl sm:text-[4.5rem] lg:text-[6.5rem] xl:text-[7.25rem]"
          >
            {t("homeHero.headline")}
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-[1.75] text-ac-sand/90 sm:text-xl">
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
          className="mt-16 max-w-md motion-safe:animate-[ac-reveal-up_1200ms_cubic-bezier(0.22,1,0.36,1)_200ms_both] motion-reduce:animate-none"
        >
          <label className="sr-only" htmlFor="hero-search">
            {t("homeHero.searchInputAriaLabel")}
          </label>
          <div className="flex items-center gap-3 border-b border-white/[0.15] pb-3 transition-colors duration-300 focus-within:border-ac-gold/50">
            <Search className="h-4 w-4 shrink-0 text-ac-sand/60" aria-hidden />
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("homeHero.searchPlaceholder")}
              className={joinClasses(
                "w-full bg-transparent py-1 text-sm text-ac-pearl outline-none placeholder:text-ac-sand/45",
                acFocus.ringDark,
              )}
            />
          </div>
        </form>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ac-limestone to-transparent"
      />
    </section>
  );
}
