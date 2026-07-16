"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DestinationChapter } from "@/app/components/atlas/destination-chapter";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
import { interpolate } from "@/lib/i18n/format";
import type { CoffeeOrigin } from "@/types/homepage";

type OriginLabels = {
  premium: string;
  altitude: string;
  process: string;
  roast: string;
  brewMethod: string;
  exploreOrigin: string;
  imageAltTemplate: string;
};

type OriginsAtlasExplorerProps = {
  origins: CoffeeOrigin[];
  eyebrow: string;
  title: string;
  description: string;
  labels: OriginLabels;
};

function originSlug(country: string) {
  return country.toLowerCase().replace(/\s+/g, "-");
}

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** World atlas — sticky country rail with full-viewport destination chapters. */
export function OriginsAtlasExplorer({
  origins,
  eyebrow,
  title,
  description,
  labels,
}: OriginsAtlasExplorerProps) {
  const [activeId, setActiveId] = useState(originSlug(origins[0]?.country ?? ""));

  const sections = useMemo(
    () =>
      origins.map((origin, index) => ({
        origin,
        id: `origin-${originSlug(origin.country)}`,
        indexLabel: String(index + 1).padStart(2, "0"),
      })),
    [origins],
  );

  useEffect(() => {
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.55] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div>
      <MotionReveal>
        <header className="max-w-3xl">
          <p className={acTypography.eyebrow}>{eyebrow} · Atlas</p>
          <h1 id="origins-atlas-heading" className={joinClasses(acTypography.displayLg, "mt-6")}>
            {title}
          </h1>
          <p className={joinClasses(acTypography.body, "mt-6 max-w-2xl")}>{description}</p>
        </header>
      </MotionReveal>

      <div className="mt-16 lg:grid lg:grid-cols-12 lg:gap-x-10">
        <nav
          aria-label="Origin compass"
          className="hidden lg:col-span-3 lg:block lg:sticky lg:top-28 lg:self-start"
        >
          <p className={acTypography.eyebrow}>Compass</p>
          <ul className="mt-6 space-y-1">
            {sections.map(({ origin, id, indexLabel }) => {
              const isActive = activeId === id;
              return (
                <li key={origin.country}>
                  <a
                    href={`#${id}`}
                    className={joinClasses(
                      acTypography.nav,
                      "flex items-baseline gap-3 py-2 transition-colors duration-300",
                      isActive ? "text-ac-espresso" : "text-ac-walnut/50 hover:text-ac-espresso",
                      acFocus.ring,
                    )}
                    aria-current={isActive ? "location" : undefined}
                  >
                    <span className={acTypography.caption}>{indexLabel}</span>
                    <span className="font-display text-lg tracking-[-0.02em]">{origin.country}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="lg:col-span-9 scroll-smooth">
          <div className="snap-y snap-mandatory space-y-0 scroll-smooth">
            {sections.map(({ origin, id, indexLabel }) => (
              <DestinationChapter
                key={origin.country}
                id={id}
                country={origin.country}
                region={origin.region}
                description={origin.tastingProfile}
                coordinates={`${indexLabel} · ${origin.process}`}
                imageSrc={origin.image}
                imageAlt={interpolate(labels.imageAltTemplate, {
                  country: origin.country,
                  region: origin.region,
                  process: origin.process,
                })}
                ctaHref="/recipes"
                ctaLabel={labels.exploreOrigin}
                routeLine={
                  <svg viewBox="0 0 120 24" className="h-6 w-full text-ac-gold/60" aria-hidden>
                    <path
                      d="M0 12 H88"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <circle cx="96" cy="12" r="3" fill="currentColor" />
                  </svg>
                }
                meta={
                  <dl className="grid gap-3 text-sm text-ac-sand/75 sm:grid-cols-2">
                    <div>
                      <dt className={acTypography.captionDark}>{labels.altitude}</dt>
                      <dd className="mt-1">{origin.altitude}</dd>
                    </div>
                    <div>
                      <dt className={acTypography.captionDark}>{labels.roast}</dt>
                      <dd className="mt-1">{origin.roastRecommendation}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className={acTypography.captionDark}>{labels.brewMethod}</dt>
                      <dd className="mt-1">{origin.brewingMethod}</dd>
                    </div>
                  </dl>
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16 lg:ml-[calc(25%+2.5rem)]">
        <Link
          href="/recipes"
          className={joinClasses(acTypography.nav, "text-ac-copper hover:text-ac-espresso", acFocus.ring)}
        >
          Explore recipes from these origins →
        </Link>
      </div>
    </div>
  );
}
