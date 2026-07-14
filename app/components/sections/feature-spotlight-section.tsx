import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons, cards, typography } from "@/lib/constants/styles";

export type FeatureSpotlightSectionProps = {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
  className?: string;
};

/**
 * Reusable homepage "feature discovery" section -- surfaces an existing
 * BrewAtlas feature (AI Coach, xBloom, culture pages, etc.) with a short
 * pitch and a CTA into the real feature page. Built entirely from
 * existing design tokens (`cards`, `buttons`, `typography`) and
 * primitives (`SectionFrame`, `RippleLink`) so every instance stays
 * visually consistent with the rest of the homepage.
 */
export function FeatureSpotlightSection({
  id,
  icon: Icon,
  eyebrow,
  title,
  description,
  highlights,
  ctaLabel,
  ctaHref,
  className = "border-y border-white/[0.04] bg-white/[0.015]",
}: FeatureSpotlightSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <SectionFrame id={id} ariaLabelledBy={headingId} className={className}>
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-600/25 bg-amber-950/40">
            <Icon className="h-6 w-6 text-amber-500/85" aria-hidden />
          </div>
          <p className={`${typography.eyebrow} mt-6`}>{eyebrow}</p>
          <h2 id={headingId} className={typography.sectionTitleModern}>
            {title}
          </h2>
          <p className={typography.sectionLead}>{description}</p>

          <div className="mt-8">
            <RippleLink href={ctaHref} className={buttons.primary}>
              {ctaLabel}
            </RippleLink>
          </div>
        </div>

        <div className={`${cards.premiumShell} p-6 lg:p-8`}>
          <div aria-hidden className={cards.premiumSheen} />
          <div aria-hidden className={cards.premiumGlow} />
          <ul className="relative space-y-4">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-3 text-sm leading-relaxed text-stone-300">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/85" aria-hidden />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionFrame>
  );
}
