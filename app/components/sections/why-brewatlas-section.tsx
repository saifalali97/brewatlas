import { RippleLink } from "@/app/components/ui/ripple-link";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { buttons, dsTypography } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";

type WhyBrewAtlasSectionProps = {
  about: Dictionary["aboutPage"];
  stats: Array<{ value: string; label: string }>;
};

/** Editorial manifesto — typography-first, no card boxes. */
export function WhyBrewAtlasSection({ about, stats }: WhyBrewAtlasSectionProps) {
  return (
    <section
      id="why-brewatlas"
      aria-labelledby="why-brewatlas-heading"
      className="relative overflow-hidden bg-ba-pearl px-6 py-32 sm:px-8 md:py-40 lg:px-12 lg:py-48 xl:px-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-ba-gold/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-ba-sand/60 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl">
        <RevealOnScroll>
          <p className={dsTypography.eyebrow}>{about.eyebrow}</p>
          <h2
            id="why-brewatlas-heading"
            className="font-display mt-8 max-w-4xl text-[2.5rem] leading-[1.04] tracking-[-0.035em] text-ba-espresso sm:text-5xl lg:text-[4.25rem]"
          >
            {about.title}
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={80}>
          <p className={`mt-12 max-w-2xl text-xl leading-[1.75] text-ba-coffee/80 lg:text-[1.375rem] lg:leading-[1.8]`}>
            {about.body}
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={120}>
          <div className="mt-16 grid gap-10 border-t border-ba-espresso/[0.08] pt-16 sm:grid-cols-3 lg:gap-16">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="font-display text-4xl tracking-[-0.03em] text-ba-espresso tabular-nums lg:text-5xl">
                  {value}
                </p>
                <p className="mt-3 text-sm uppercase tracking-[0.14em] text-ba-coffee/55">{label}</p>
              </div>
            ))}
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={160}>
          <div className="mt-16">
            <RippleLink href="/recipes" className={buttons.primary}>
              {about.exploreRecipesCta}
            </RippleLink>
          </div>
        </RevealOnScroll>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-ba-sand/80"
      />
    </section>
  );
}
