import { Chapter } from "@/app/components/atlas/chapter";
import { Invitation } from "@/app/components/atlas/invitation";
import { MotionReveal } from "@/lib/design-system/motion";
import type { Dictionary } from "@/lib/i18n/types";
import type { Testimonial } from "@/types/homepage";

type PremiumExperienceSectionProps = {
  copy: Dictionary["homePremiumExperience"];
  testimonials: Testimonial[];
};

/** Chapter 7 — The Circle. Members-club invitation, not a pricing grid. */
export function PremiumExperienceSection({ copy, testimonials }: PremiumExperienceSectionProps) {
  const benefitEntries = [
    copy.benefits.recipes,
    copy.benefits.coach,
    copy.benefits.tracking,
    copy.benefits.saves,
  ];

  const featuredTestimonial = testimonials[0];

  const prose = (
    <>
      {benefitEntries.map((benefit) => (
        <div key={benefit.title}>
          <h3 className="text-lg font-medium text-ac-pearl">{benefit.title}</h3>
          <p className="mt-2 text-ac-sand/70">{benefit.description}</p>
        </div>
      ))}
      {featuredTestimonial ? (
        <figure className="mt-8 border-t border-white/[0.08] pt-10">
          <blockquote className="font-display text-xl leading-[1.4] tracking-[-0.02em] text-ac-pearl sm:text-2xl">
            &ldquo;{featuredTestimonial.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6">
            <p className="font-medium text-ac-pearl">{featuredTestimonial.name}</p>
            <p className="mt-1 text-sm text-ac-sand/65">
              {featuredTestimonial.role} · {featuredTestimonial.location}
            </p>
          </figcaption>
        </figure>
      ) : null}
      <p className="text-ac-sand/70">{copy.ctaDescription}</p>
    </>
  );

  return (
    <Chapter
      id="the-circle"
      rhythm="night"
      padding="chapter"
      ariaLabelledBy="premium-experience-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,165,116,0.12),transparent)]"
      />

      <MotionReveal>
        <Invitation
          eyebrow={copy.eyebrow}
          title={copy.title}
          prose={prose}
          ctaHref="/premium"
          ctaLabel={copy.ctaPrimary}
          secondaryHref="/premium"
          secondaryLabel={copy.ctaSecondary}
          signature={`${copy.statMembersValue} ${copy.statMembersLabel} · ${copy.statRatingValue}`}
        />
      </MotionReveal>
    </Chapter>
  );
}
