import { BookOpen, Brain, Bookmark, LineChart } from "lucide-react";
import { AnimatedStat } from "@/app/components/ui/animated-stat";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { buttons, dsTypography } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";
import type { Testimonial } from "@/types/homepage";

type PremiumExperienceSectionProps = {
  copy: Dictionary["homePremiumExperience"];
  testimonials: Testimonial[];
};

const benefitIcons = [BookOpen, Brain, LineChart, Bookmark] as const;

/** Luxury closing chapter — narrative flow, minimal boxes. */
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

  const featuredTestimonial = testimonials[0];

  return (
    <section
      id="premium-experience"
      aria-labelledby="premium-experience-heading"
      className="section-espresso-gradient hero-grain relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(184,149,107,0.14),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-32 sm:px-8 md:py-40 lg:px-12 lg:py-48 xl:px-16">
        <RevealOnScroll>
          <p className={dsTypography.eyebrowDark}>{copy.eyebrow}</p>
          <h2 id="premium-experience-heading" className={`mt-8 max-w-3xl ${dsTypography.displayDark} text-4xl sm:text-5xl lg:text-[4.5rem]`}>
            {copy.title}
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <ul className="mt-20 grid gap-0 border-y border-white/[0.08] sm:grid-cols-2">
            {benefitEntries.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <li
                  key={benefit.title}
                  className="flex gap-5 border-b border-white/[0.06] px-0 py-8 sm:odd:border-e sm:odd:pe-10 sm:even:ps-10 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-ba-gold/85" aria-hidden />
                  <div>
                    <h3 className="text-lg font-medium text-ba-pearl">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ba-sand-deep/70">{benefit.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </RevealOnScroll>

        {featuredTestimonial && (
          <RevealOnScroll delay={120}>
            <figure className="mt-24 max-w-3xl">
              <blockquote className="font-display text-2xl leading-[1.35] tracking-[-0.02em] text-ba-pearl sm:text-3xl lg:text-4xl">
                &ldquo;{featuredTestimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <div className="h-px flex-1 max-w-12 bg-ba-gold/50" aria-hidden />
                <div>
                  <p className="font-medium text-ba-pearl">{featuredTestimonial.name}</p>
                  <p className="mt-1 text-sm text-ba-sand-deep/65">
                    {featuredTestimonial.role} · {featuredTestimonial.location}
                  </p>
                </div>
              </figcaption>
            </figure>
          </RevealOnScroll>
        )}

        <RevealOnScroll delay={160}>
          <div className="mt-24 grid gap-10 border-t border-white/[0.08] pt-16 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) =>
              index < 2 ? (
                <AnimatedStat key={stat.label} value={stat.value} label={stat.label} variant="dark" />
              ) : (
                <div key={stat.label} className="text-center sm:text-left">
                  <p className="font-display text-4xl tracking-tight text-ba-pearl tabular-nums lg:text-5xl">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm uppercase tracking-[0.12em] text-ba-sand-deep/60">{stat.label}</p>
                </div>
              ),
            )}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <div className="mt-24 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <RippleLink href="/premium" className={`${buttons.primaryLight} min-w-[220px]`}>
              {copy.ctaPrimary}
            </RippleLink>
            <p className="max-w-sm text-sm leading-relaxed text-ba-sand-deep/70">{copy.ctaDescription}</p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
