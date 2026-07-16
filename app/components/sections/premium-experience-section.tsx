import { BookOpen, Brain, Bookmark, LineChart } from "lucide-react";
import { AnimatedStat } from "@/app/components/ui/animated-stat";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { TextLink } from "@/app/components/ui/text-link";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { buttons, cards, dsRadius, dsTypography } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";
import type { Testimonial } from "@/types/homepage";

type PremiumExperienceSectionProps = {
  copy: Dictionary["homePremiumExperience"];
  testimonials: Testimonial[];
};

const benefitIcons = [BookOpen, Brain, LineChart, Bookmark] as const;

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function TestimonialQuote({ item }: { item: Testimonial }) {
  return (
    <figure
      className={joinClasses(
        cards.testimonialDark,
        "flex h-full flex-col p-8 motion-reduce:transform-none motion-reduce:hover:translate-y-0",
      )}
    >
      <blockquote className={`flex-1 text-base leading-[1.75] ${dsTypography.bodyDark}`}>
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-8 border-t border-white/[0.08] pt-6">
        <p className="font-medium text-ba-pearl">{item.name}</p>
        <p className="mt-1.5 text-sm text-ba-sand-deep/65">{item.role}</p>
        <p className="mt-1 text-xs text-ba-gold/75">{item.location}</p>
      </figcaption>
    </figure>
  );
}

/** Homepage closing section — benefits, testimonials, stats, and a single calm CTA. */
export function PremiumExperienceSection({ copy, testimonials }: PremiumExperienceSectionProps) {
  const benefitEntries = [
    copy.benefits.recipes,
    copy.benefits.coach,
    copy.benefits.tracking,
    copy.benefits.saves,
  ];

  const stats = [
    { value: copy.statRecipesValue, label: copy.statRecipesLabel },
    { value: copy.statMembersValue, label: copy.statMembersLabel },
    { value: copy.statRatingValue, label: copy.statRatingLabel },
    { value: copy.statPriceValue, label: copy.statPriceLabel },
  ];

  return (
    <SectionFrame
      id="premium-experience"
      ariaLabelledBy="premium-experience-heading"
      padding="compact"
      theme="espresso"
    >
      <RevealOnScroll>
        <p className={dsTypography.eyebrowDark}>{copy.eyebrow}</p>
        <h2 id="premium-experience-heading" className={`mt-5 max-w-2xl ${dsTypography.h1Dark}`}>
          {copy.title}
        </h2>
      </RevealOnScroll>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {benefitEntries.map((benefit, index) => {
          const Icon = benefitIcons[index];
          return (
            <RevealOnScroll key={benefit.title} delay={index * 60}>
              <div
                className={joinClasses(
                  dsRadius.card,
                  "h-full border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ba-gold/25 bg-ba-gold/10 text-ba-gold">
                  <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden />
                </div>
                <h3 className="mt-5 text-base font-medium text-ba-pearl">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ba-sand-deep/65">{benefit.description}</p>
              </div>
            </RevealOnScroll>
          );
        })}
      </div>

      <RevealOnScroll className="mt-20" delay={80}>
        <p className={dsTypography.eyebrowDark}>{copy.testimonialsEyebrow}</p>
        <h3 className={`mt-4 ${dsTypography.h2Dark}`}>{copy.testimonialsTitle}</h3>
      </RevealOnScroll>

      <div className="mt-10 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
        {testimonials.slice(0, 3).map((item, index) => (
          <RevealOnScroll key={item.name} className="min-w-[85%] snap-start sm:min-w-[24rem] lg:min-w-0" delay={120 + index * 60}>
            <TestimonialQuote item={item} />
          </RevealOnScroll>
        ))}
      </div>

      <RevealOnScroll className="mt-20" delay={160}>
        <div className="grid gap-8 border-y border-white/[0.08] py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, index) =>
            index < 2 ? (
              <AnimatedStat key={stat.label} value={stat.value} label={stat.label} variant="dark" />
            ) : (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="font-display text-3xl tracking-tight text-ba-pearl tabular-nums sm:text-4xl lg:text-[2.75rem] lg:leading-none">
                  {stat.value}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-ba-sand-deep/65">{stat.label}</p>
              </div>
            ),
          )}
        </div>
      </RevealOnScroll>

      <RevealOnScroll className="mt-16" delay={200}>
        <div
          className={joinClasses(
            dsRadius.card,
            "mx-auto max-w-2xl border border-white/[0.1] bg-white/[0.05] px-8 py-12 text-center backdrop-blur-xl sm:px-12 sm:py-14",
          )}
        >
          <h3 className={`${dsTypography.h2Dark} text-[1.75rem]`}>{copy.ctaTitle}</h3>
          <p className={`mx-auto mt-4 max-w-md ${dsTypography.bodyDark}`}>{copy.ctaDescription}</p>
          <div className="mt-8 flex flex-col items-center gap-4">
            <RippleLink href="/premium" className={`${buttons.primaryLight} min-w-[220px]`}>
              {copy.ctaPrimary}
            </RippleLink>
            <TextLink href="/premium#premium-plans" variant="navOnDark">
              {copy.ctaSecondary} →
            </TextLink>
          </div>
        </div>
      </RevealOnScroll>
    </SectionFrame>
  );
}
