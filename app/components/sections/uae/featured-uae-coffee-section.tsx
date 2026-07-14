import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { UaePatternDivider } from "@/app/components/ui/uae-pattern-divider";
import { UAE_BRAND_STORY } from "@/lib/branding/uae-theme";

type FeaturedUaeCoffeeSectionProps = {
  guideHref?: string;
};

/**
 * Reusable "Featured UAE Coffee" homepage banner (requirement 6) --
 * the flagship brand-identity surface, distinct from the more
 * editorial `UaeCoffeeCultureSection`/`CoffeeHeritageSection`. Not
 * wired into `app/(site)/page.tsx`; uses the additive UAE brand tokens
 * from `lib/branding/uae-theme.ts` exclusively (no existing color,
 * spacing, or typography token is touched).
 */
export function FeaturedUaeCoffeeSection({ guideHref = "/culture/guide" }: FeaturedUaeCoffeeSectionProps) {
  return (
    <SectionFrame id="uae-featured-coffee" ariaLabelledBy="uae-featured-coffee-heading" showDividers={false}>
      <div className="relative overflow-hidden rounded-[2rem] border border-uae-warm-gold/[0.22] bg-gradient-to-br from-uae-dark-coffee via-uae-dark-coffee-deep to-[#0a0705] px-6 py-14 text-center sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(192,138,46,0.16),transparent_60%)]"
        />

        <UaePatternDivider className="mx-auto max-w-xs opacity-70" />

        <p className="mt-8 text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-uae-sand">
          {UAE_BRAND_STORY.eyebrow}
        </p>
        <h2
          id="uae-featured-coffee-heading"
          className="mx-auto mt-5 max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.03em] text-uae-pearl sm:text-4xl lg:text-[3rem]"
        >
          {UAE_BRAND_STORY.tagline}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-[1.75] text-uae-pearl-deep/80 md:text-lg">
          {UAE_BRAND_STORY.description}
        </p>

        <div className="mt-9 flex justify-center">
          <GhostCtaLink href={guideHref} autoWidth>
            Explore the Emirati Coffee Guide
          </GhostCtaLink>
        </div>

        <UaePatternDivider className="mx-auto mt-10 max-w-xs rotate-180 opacity-70" />
      </div>
    </SectionFrame>
  );
}
