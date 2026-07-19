import { Portal } from "@/app/components/atlas/portal";
import { acTypography } from "@/lib/design-system/atlas-canon";
import type { Dictionary } from "@/lib/i18n/types";

const GATEWAY_IMAGES = {
  coffee: "/images/recipes/espresso-shot.png",
  gulfHeritage: "/images/culture/arabic-coffee-hero.png",
  aiCoach: "/images/culture/tea-hero.png",
} as const;

type GatewaySectionProps = {
  copy: Dictionary["homeGateway"];
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Minimal homepage — three destination portals, no clutter. */
export function GatewaySection({ copy }: GatewaySectionProps) {
  const { destinations } = copy;

  return (
    <section
      id="gateway"
      aria-label={copy.sectionAriaLabel}
      className="relative flex min-h-[calc(100svh-4.5rem)] flex-col bg-ac-limestone"
    >
      <header className="shrink-0 px-6 pb-10 pt-16 text-center sm:px-8 sm:pb-12 sm:pt-20 lg:px-12 lg:pb-14 lg:pt-24">
        <h1 className={joinClasses(acTypography.displayLg, "tracking-[-0.04em]")}>{copy.title}</h1>
        <p className={joinClasses(acTypography.body, "mx-auto mt-5 max-w-md text-ac-espresso")}>
          {copy.subtitle}
        </p>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-1 sm:gap-1.5 md:grid-cols-3 md:gap-1.5 lg:gap-2">
        <Portal
          href="/recipes"
          eyebrow="01"
          title={destinations.coffee.title}
          enterLabel={copy.enterLabel}
          imageSrc={GATEWAY_IMAGES.coffee}
          imageAlt={destinations.coffee.imageAlt}
          tone="warm"
          size="gateway"
          priority
          minimal
        />
        <Portal
          href="/gulf-heritage"
          eyebrow="02"
          title={destinations.gulfHeritage.title}
          tagline={destinations.gulfHeritage.tagline}
          enterLabel={copy.enterLabel}
          imageSrc={GATEWAY_IMAGES.gulfHeritage}
          imageAlt={destinations.gulfHeritage.imageAlt}
          tone="earth"
          size="gateway"
          minimal
        />
        <Portal
          href="/ai-coach"
          eyebrow="03"
          title={destinations.aiCoach.title}
          tagline={destinations.aiCoach.tagline}
          enterLabel={copy.enterLabel}
          imageSrc={GATEWAY_IMAGES.aiCoach}
          imageAlt={destinations.aiCoach.imageAlt}
          tone="sand"
          size="gateway"
          minimal
          badge={copy.comingSoonBadge}
        />
      </div>
    </section>
  );
}
