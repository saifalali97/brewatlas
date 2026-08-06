import { Portal } from "@/app/components/atlas/portal";
import { acTypography } from "@/lib/design-system/atlas-canon";
import type { Dictionary } from "@/lib/i18n/types";

const GATEWAY_IMAGES = {
  coffee: "/images/recipes/espresso-shot.webp",
  gulfDirectory: "/images/culture/arabic-coffee-hero.webp",
  aiCoach: "/images/culture/tea-hero.webp",
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
      className="relative flex min-h-[calc(100svh-4.5rem)] flex-col bg-ac-limestone lg:min-h-[calc(100svh-env(safe-area-inset-top,0px))]"
    >
      <header className="mx-auto w-full max-w-3xl shrink-0 px-6 pb-8 pt-12 text-center sm:px-8 sm:pb-10 sm:pt-16 lg:px-12 lg:pb-12 lg:pt-20">
        <h1 className={joinClasses(acTypography.displayLg, "tracking-[-0.04em]")}>{copy.title}</h1>
        <p
          className={joinClasses(
            acTypography.body,
            "mx-auto mt-4 max-w-lg text-balance text-ac-espresso/72 sm:mt-5",
          )}
        >
          {copy.subtitle}
        </p>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-1.5 md:grid-cols-3 md:gap-2 lg:gap-2.5">
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
          emphasizeEnter
        />
        <Portal
          href="/recipes"
          eyebrow="02"
          title={destinations.gulfDirectory.title}
          tagline={destinations.gulfDirectory.tagline}
          enterLabel={copy.enterLabel}
          imageSrc={GATEWAY_IMAGES.gulfDirectory}
          imageAlt={destinations.gulfDirectory.imageAlt}
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
