import { Chapter } from "@/app/components/atlas/chapter";
import { Portal } from "@/app/components/atlas/portal";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
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

/** Chapter 2 — Six Worlds. Asymmetric portal composition, not equal bento. */
export function DiscoverSection({ copy }: DiscoverSectionProps) {
  const { worlds } = copy;
  const enter = copy.enterLabel;

  return (
    <Chapter
      id="six-worlds"
      rhythm="sand"
      padding="chapter"
      wide
      ariaLabelledBy="discover-heading"
    >
      <MotionReveal>
        <p className={acTypography.eyebrow}>{copy.eyebrow}</p>
        <h2 id="discover-heading" className={`mt-6 max-w-3xl ${acTypography.h1}`}>
          {copy.title}
        </h2>
        <p className={`mt-8 max-w-xl ${acTypography.body}`}>{copy.description}</p>
      </MotionReveal>

      <div className="mt-20 grid gap-5 lg:grid-cols-12 lg:gap-6">
        <MotionReveal className="lg:col-span-8">
          <Portal
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
        </MotionReveal>

        <div className="grid gap-5 lg:col-span-4 lg:grid-rows-2 lg:gap-6">
          <MotionReveal delay={60}>
            <Portal
              href="/origins"
              eyebrow={worlds.origins.eyebrow}
              title={worlds.origins.title}
              tagline={worlds.origins.tagline}
              enterLabel={enter}
              imageSrc={WORLD_IMAGES.origins}
              imageAlt={worlds.origins.imageAlt}
              tone="earth"
              size="small"
            />
          </MotionReveal>
          <MotionReveal delay={120}>
            <Portal
              href="/culture"
              eyebrow={worlds.culture.eyebrow}
              title={worlds.culture.title}
              tagline={worlds.culture.tagline}
              enterLabel={enter}
              imageSrc={WORLD_IMAGES.culture}
              imageAlt={worlds.culture.imageAlt}
              tone="sand"
              size="small"
            />
          </MotionReveal>
        </div>

        <MotionReveal className="lg:col-span-5" delay={160}>
          <Portal
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
        </MotionReveal>

        <MotionReveal className="lg:col-span-7" delay={200}>
          <Portal
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
        </MotionReveal>
      </div>
    </Chapter>
  );
}
