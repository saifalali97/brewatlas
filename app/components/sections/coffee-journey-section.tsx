"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { dsFocus, dsMotion, dsTypography } from "@/lib/constants/styles";
import type { BrewingMethod } from "@/types/homepage";

const JOURNEY_STEPS = ["01", "02", "03", "04"] as const;

type CoffeeJourneySectionProps = {
  methods: BrewingMethod[];
  eyebrow: string;
  title: string;
  description: string;
};

/** Full-bleed brew journey — cinematic panels, not timeline cards. */
export function CoffeeJourneySection({
  methods,
  eyebrow,
  title,
  description,
}: CoffeeJourneySectionProps) {
  const chapters = methods.slice(0, 4);

  return (
    <section id="coffee-journey" aria-labelledby="coffee-journey-heading" className="bg-ba-espresso">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <RevealOnScroll>
          <p className={dsTypography.eyebrowDark}>{eyebrow}</p>
          <h2 id="coffee-journey-heading" className={`mt-6 max-w-3xl ${dsTypography.h1Dark}`}>
            {title}
          </h2>
          <p className={`mt-8 max-w-xl ${dsTypography.bodyDark}`}>{description}</p>
        </RevealOnScroll>
      </div>

      <div className="space-y-0">
        {chapters.map((method, index) => {
          const step = JOURNEY_STEPS[index] ?? String(index + 1).padStart(2, "0");
          const imageRight = index % 2 === 1;

          return (
            <RevealOnScroll key={method.name} delay={index * 60}>
              <Link
                href="/methods"
                className={`group relative grid min-h-[28rem] overflow-hidden lg:min-h-[36rem] lg:grid-cols-2 ${dsFocus.ringDark}`}
              >
                <div
                  className={`relative min-h-[20rem] ${imageRight ? "lg:order-2" : ""}`}
                >
                  <Image
                    src={method.image}
                    alt={method.name}
                    fill
                    sizes="50vw"
                    className={`object-cover brightness-[0.75] saturate-[0.88] ${dsMotion.transitionSlow} motion-safe:group-hover:scale-[1.03]`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ba-espresso/90 via-ba-espresso/20 to-transparent lg:bg-gradient-to-r lg:from-ba-espresso/30 lg:via-transparent lg:to-ba-espresso/30" />
                </div>

                <div
                  className={`relative flex flex-col justify-center bg-ba-espresso px-8 py-14 sm:px-12 lg:px-16 lg:py-20 xl:px-20 ${imageRight ? "lg:order-1" : ""}`}
                >
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-ba-gold/80">
                    {step} — {method.brewTime}
                  </span>
                  <h3 className="font-display mt-6 text-4xl leading-[1.06] tracking-[-0.03em] text-ba-pearl sm:text-5xl lg:text-[3.25rem]">
                    {method.name}
                  </h3>
                  <p className="mt-6 max-w-md text-base leading-[1.75] text-ba-sand-deep/85 lg:text-lg">
                    {method.description}
                  </p>

                  <div className="mt-10 flex flex-wrap gap-8 border-t border-white/[0.08] pt-8">
                    {[
                      { label: "Body", value: method.body },
                      { label: "Acidity", value: method.acidity },
                      { label: "Sweetness", value: method.sweetness },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ba-sand-deep/55">
                          {label}
                        </p>
                        <p className="font-display mt-1 text-2xl text-ba-pearl">{value}/5</p>
                      </div>
                    ))}
                  </div>

                  <span className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-ba-gold">
                    Explore method
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          );
        })}
      </div>
    </section>
  );
}
