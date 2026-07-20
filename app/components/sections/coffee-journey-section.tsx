import Image from "next/image";
import Link from "next/link";
import { Chapter } from "@/app/components/atlas/chapter";
import { acFocus, acMotion, acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
import type { BrewingMethod } from "@/types/homepage";

type CoffeeCraftSectionProps = {
  method: BrewingMethod | undefined;
  eyebrow: string;
  title: string;
  description: string;
};

/** Chapter 5 — The Craft. One method, full-bleed — mastery over inventory. */
export function CoffeeCraftSection({
  method,
  eyebrow,
  title,
  description,
}: CoffeeCraftSectionProps) {
  if (!method) return null;

  return (
    <Chapter
      id="the-craft"
      rhythm="night"
      padding="compact"
      wide
      ariaLabelledBy="craft-heading"
      className="!pb-0"
    >
      <div className="mx-auto max-w-7xl px-0 sm:px-0">
        <MotionReveal>
          <p className={acTypography.eyebrowDark}>{eyebrow}</p>
          <h2 id="craft-heading" className={`mt-6 max-w-3xl ${acTypography.h1Dark}`}>
            {title}
          </h2>
          <p className={`mt-8 max-w-xl ${acTypography.bodyDark}`}>{description}</p>
        </MotionReveal>
      </div>

      <MotionReveal delay={100} className="mt-16">
        <Link
          href="/methods"
          className={`group relative grid min-h-[32rem] overflow-hidden lg:min-h-[40rem] lg:grid-cols-2 ${acFocus.ringDark}`}
        >
          <div className="relative min-h-[22rem]">
            <Image
              src={method.image}
              alt={method.name}
              fill
              sizes="50vw"
              className={`photo-grade-workshop object-cover ${acMotion.transitionPassage} motion-safe:group-hover:brightness-[1.03]`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ac-espresso/90 via-ac-espresso/20 to-transparent lg:bg-gradient-to-r lg:from-ac-espresso/30 lg:via-transparent lg:to-transparent" />
          </div>

          <div className="relative flex flex-col justify-center bg-ac-espresso px-8 py-14 sm:px-12 lg:px-16 lg:py-20 xl:px-20">
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-ac-gold/80">
              01 — {method.brewTime}
            </span>
            <h3 className="font-display mt-6 text-4xl leading-[1.06] tracking-[-0.03em] text-ac-pearl sm:text-5xl lg:text-[3.25rem]">
              {method.name}
            </h3>
            <p className="mt-6 max-w-md text-base leading-[1.75] text-ac-sand/85 lg:text-lg">
              {method.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-8 border-t border-ba-espresso/08 pt-8">
              {[
                { label: "Body", value: method.body },
                { label: "Acidity", value: method.acidity },
                { label: "Sweetness", value: method.sweetness },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ac-sand/55">
                    {label}
                  </p>
                  <p className="font-display mt-1 text-2xl text-ac-pearl">{value}/5</p>
                </div>
              ))}
            </div>

            <span className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-ac-gold">
              Explore method →
            </span>
          </div>
        </Link>
      </MotionReveal>
    </Chapter>
  );
}

/** @deprecated Use CoffeeCraftSection — kept for import compat */
export function CoffeeJourneySection({
  methods,
  eyebrow,
  title,
  description,
}: {
  methods: BrewingMethod[];
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <CoffeeCraftSection
      method={methods[0]}
      eyebrow={eyebrow}
      title={title}
      description={description}
    />
  );
}
