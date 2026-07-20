import { Chapter } from "@/app/components/atlas/chapter";
import { Destination, DestinationRail } from "@/app/components/atlas/destination";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons } from "@/lib/constants/styles";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
import { interpolate } from "@/lib/i18n/format";
import type { OriginCardLabels } from "@/app/components/cards/origin-card";
import type { CoffeeOrigin } from "@/types/homepage";

type OriginsAtlasSectionProps = {
  origins: CoffeeOrigin[];
  eyebrow: string;
  title: string;
  description: string;
  cardLabels: OriginCardLabels;
};

/** Chapter 4 — The Route. Horizontal world atlas with destination panels. */
export function OriginsAtlasSection({
  origins,
  eyebrow,
  title,
  description,
  cardLabels,
}: OriginsAtlasSectionProps) {
  return (
    <Chapter
      id="the-route"
      rhythm="sand"
      padding="compact"
      wide
      ariaLabelledBy="origins-heading"
      className="overflow-hidden"
    >
      <MotionReveal>
        <p className={acTypography.eyebrow}>{eyebrow}</p>
        <h2 id="origins-heading" className={`mt-6 max-w-3xl ${acTypography.h1}`}>
          {title}
        </h2>
        <p className={`mt-8 max-w-xl ${acTypography.body}`}>{description}</p>
      </MotionReveal>

      <MotionReveal delay={100} className="mt-16 -mx-6 sm:-mx-8 lg:-mx-12 xl:-mx-16">
        <DestinationRail className="px-6 sm:px-8 lg:px-12 xl:px-16">
          {origins.map((origin, index) => (
            <Destination
              key={origin.country}
              href="/origins"
              country={origin.country}
              region={origin.region}
              description={origin.tastingProfile}
              coordinates={`${String(index + 1).padStart(2, "0")} · ${origin.process}`}
              imageSrc={origin.image}
              imageAlt={interpolate(cardLabels.imageAltTemplate, {
                country: origin.country,
                region: origin.region,
                process: origin.process,
              })}
              meta={
                <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.12em] text-ac-sand/65">
                  <span>{origin.altitude}</span>
                  <span>{origin.roastRecommendation}</span>
                </div>
              }
            />
          ))}
        </DestinationRail>
      </MotionReveal>

      <MotionReveal delay={160}>
        <div className="mt-16">
          <RippleLink href="/origins" className={buttons.secondary}>
            View the Atlas →
          </RippleLink>
        </div>
      </MotionReveal>
    </Chapter>
  );
}
