import { RippleLink } from "@/app/components/ui/ripple-link";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons, dsTypography } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";

type WhyBrewAtlasSectionProps = {
  about: Dictionary["aboutPage"];
  hero: Dictionary["homeHero"];
  stats: Array<{ value: string; label: string }>;
};

/** Editorial “Why BrewAtlas” — platform purpose with calm stat rhythm. */
export function WhyBrewAtlasSection({ about, hero, stats }: WhyBrewAtlasSectionProps) {
  return (
    <SectionFrame id="why-brewatlas" ariaLabelledBy="why-brewatlas-heading" theme="pearl" padding="compact">
      <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
        <RevealOnScroll>
          <p className={dsTypography.eyebrow}>{about.eyebrow}</p>
          <h2 id="why-brewatlas-heading" className={`mt-5 ${dsTypography.h1}`}>
            {about.title}
          </h2>
          <p className={`mt-8 max-w-xl ${dsTypography.body}`}>{about.body}</p>
          <div className="mt-10">
            <RippleLink href="/recipes" className={buttons.primary}>
              {about.exploreRecipesCta}
            </RippleLink>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <div className="relative overflow-hidden rounded-[1.25rem] border border-ba-espresso/[0.06] bg-ba-sand/40 p-8 sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ba-gold/15 blur-3xl"
            />
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ba-bronze">
              {hero.eyebrow}
            </p>
            <p className="font-display mt-4 text-2xl leading-[1.15] tracking-[-0.02em] text-ba-espresso sm:text-3xl">
              {hero.headline}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ba-coffee/75">{hero.subtitle}</p>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ba-espresso/[0.08] pt-8">
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ba-coffee/55">
                    {label}
                  </dt>
                  <dd className="font-display mt-2 text-lg tracking-[-0.02em] text-ba-espresso">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </RevealOnScroll>
      </div>
    </SectionFrame>
  );
}
