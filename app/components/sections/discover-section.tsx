import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import { WorldPortal } from "@/app/components/ui/world-portal";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import type { Dictionary } from "@/lib/i18n/types";

const WORLD_IMAGES = {
  recipes: "/images/recipes/espresso-shot.png",
  devices: "/images/recipes/aeropress-brew.png",
  origins: "/images/recipes/cupping-flight.png",
  roasters: "/images/recipes/roastery-bags.png",
  culture: "/images/culture/majlis-gathering.png",
  premium: "/images/recipes/coffee-beans-macro.png",
} as const;

type DiscoverSectionProps = {
  copy: Dictionary["homeDiscover"];
};

/** Explore Coffee — asymmetric editorial bento, no card grid. */
export function DiscoverSection({ copy }: DiscoverSectionProps) {
  const { worlds } = copy;
  const enter = copy.enterLabel;

  return (
    <SectionFrame id="discover" ariaLabelledBy="discover-heading" theme="sand" padding="standard" wide showDividers>
      <SectionIntro
        headingId="discover-heading"
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        centered
      />

      <div className="mt-20 grid gap-5 lg:grid-cols-12 lg:gap-6">
        <RevealOnScroll className="lg:col-span-7">
          <WorldPortal
            href="/recipes"
            eyebrow={worlds.recipes.eyebrow}
            title={worlds.recipes.title}
            tagline={worlds.recipes.tagline}
            enterLabel={enter}
            imageSrc={WORLD_IMAGES.recipes}
            imageAlt={worlds.recipes.imageAlt}
            tone="warm"
            size="large"
            priority
          />
        </RevealOnScroll>

        <div className="grid gap-5 lg:col-span-5 lg:grid-rows-2 lg:gap-6">
          <RevealOnScroll delay={60}>
            <WorldPortal
              href="/origins"
              eyebrow={worlds.origins.eyebrow}
              title={worlds.origins.title}
              tagline={worlds.origins.tagline}
              enterLabel={enter}
              imageSrc={WORLD_IMAGES.origins}
              imageAlt={worlds.origins.imageAlt}
              tone="palm"
              size="small"
            />
          </RevealOnScroll>
          <RevealOnScroll delay={120}>
            <WorldPortal
              href="/culture"
              eyebrow={worlds.culture.eyebrow}
              title={worlds.culture.title}
              tagline={worlds.culture.tagline}
              enterLabel={enter}
              imageSrc={WORLD_IMAGES.culture}
              imageAlt={worlds.culture.imageAlt}
              tone="culture"
              size="small"
            />
          </RevealOnScroll>
        </div>

        <RevealOnScroll className="lg:col-span-5" delay={160}>
          <WorldPortal
            href="/devices"
            eyebrow={worlds.devices.eyebrow}
            title={worlds.devices.title}
            tagline={worlds.devices.tagline}
            enterLabel={enter}
            imageSrc={WORLD_IMAGES.devices}
            imageAlt={worlds.devices.imageAlt}
            tone="neutral"
            size="tall"
          />
        </RevealOnScroll>

        <RevealOnScroll className="lg:col-span-7" delay={200}>
          <WorldPortal
            href="/roasters"
            eyebrow={worlds.roasters.eyebrow}
            title={worlds.roasters.title}
            tagline={worlds.roasters.tagline}
            enterLabel={enter}
            imageSrc={WORLD_IMAGES.roasters}
            imageAlt={worlds.roasters.imageAlt}
            tone="sand"
            size="large"
          />
        </RevealOnScroll>

        <RevealOnScroll className="lg:col-span-12" delay={240}>
          <WorldPortal
            href="/premium"
            eyebrow={worlds.premium.eyebrow}
            title={worlds.premium.title}
            tagline={worlds.premium.tagline}
            enterLabel={enter}
            imageSrc={WORLD_IMAGES.premium}
            imageAlt={worlds.premium.imageAlt}
            tone="gold"
            size="large"
          />
        </RevealOnScroll>
      </div>
    </SectionFrame>
  );
}
