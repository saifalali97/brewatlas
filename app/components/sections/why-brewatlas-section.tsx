import { Chapter } from "@/app/components/atlas/chapter";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons } from "@/lib/constants/styles";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
import type { Dictionary } from "@/lib/i18n/types";

type WhyBrewAtlasSectionProps = {
  about: Dictionary["aboutPage"];
  stats: Array<{ value: string; label: string }>;
};

/** Chapter 1 — The Map. Manifesto typography + inline stats rail. */
export function WhyBrewAtlasSection({ about, stats }: WhyBrewAtlasSectionProps) {
  return (
    <Chapter id="the-map" rhythm="dawn" padding="chapter" ariaLabelledBy="why-brewatlas-heading">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-ac-gold/8 blur-3xl"
      />

      <MotionReveal>
        <p className={acTypography.eyebrow}>{about.eyebrow}</p>
        <h2
          id="why-brewatlas-heading"
          className="font-display mt-8 max-w-4xl text-[2.5rem] leading-[1.04] tracking-[-0.035em] text-ac-espresso sm:text-5xl lg:text-[4.25rem]"
        >
          {about.title}
        </h2>
      </MotionReveal>

      <MotionReveal delay={80}>
        <p className="mt-12 max-w-2xl text-xl leading-[1.75] text-ac-espresso lg:text-[1.375rem] lg:leading-[1.8]">
          {about.body}
        </p>
      </MotionReveal>

      <MotionReveal delay={120}>
        <div className="mt-16 grid gap-10 border-t border-ac-espresso/[0.08] pt-16 sm:grid-cols-3 lg:gap-16">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center sm:text-left">
              <p className="font-display text-4xl tracking-[-0.03em] text-ac-espresso tabular-nums lg:text-5xl">
                {value}
              </p>
              <p className="mt-3 text-sm uppercase tracking-[0.14em] text-ac-espresso">{label}</p>
            </div>
          ))}
        </div>
      </MotionReveal>

      <MotionReveal delay={160}>
        <div className="mt-16">
          <RippleLink href="/recipes" className={buttons.primary}>
            {about.exploreRecipesCta}
          </RippleLink>
        </div>
      </MotionReveal>
    </Chapter>
  );
}
