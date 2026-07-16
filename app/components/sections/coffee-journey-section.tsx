import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import { dsRadius, dsTypography } from "@/lib/constants/styles";
import type { BrewingMethod } from "@/types/homepage";

const JOURNEY_STEPS = ["01", "02", "03", "04"] as const;

type CoffeeJourneySectionProps = {
  methods: BrewingMethod[];
  eyebrow: string;
  title: string;
  description: string;
};

/** Immersive brew journey — timeline rhythm from bean to cup. */
export function CoffeeJourneySection({
  methods,
  eyebrow,
  title,
  description,
}: CoffeeJourneySectionProps) {
  const chapters = methods.slice(0, 4);

  return (
    <SectionFrame id="coffee-journey" ariaLabelledBy="coffee-journey-heading" theme="sand" padding="compact">
      <SectionIntro
        headingId="coffee-journey-heading"
        eyebrow={eyebrow}
        title={title}
        description={description}
        centered
      />

      <div className="relative mx-auto max-w-4xl">
        <div
          aria-hidden
          className="absolute start-6 top-0 hidden h-full w-px bg-gradient-to-b from-ba-bronze/40 via-ba-bronze/20 to-transparent lg:start-1/2 lg:block lg:-translate-x-1/2"
        />

        <div className="space-y-12 lg:space-y-16">
          {chapters.map((method, index) => {
            const step = JOURNEY_STEPS[index] ?? String(index + 1).padStart(2, "0");
            const isEven = index % 2 === 1;

            return (
              <RevealOnScroll key={method.name} delay={index * 80}>
                <div
                  className={`relative grid gap-6 lg:grid-cols-2 lg:gap-12 ${isEven ? "lg:direction-rtl" : ""}`}
                >
                  <div className={`${isEven ? "lg:direction-ltr lg:col-start-2" : ""}`}>
                    <span className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ba-bronze">
                      {step}
                    </span>
                    <h3 className={`mt-3 ${dsTypography.h2}`}>{method.name}</h3>
                    <p className={`mt-4 max-w-md ${dsTypography.body}`}>{method.description}</p>
                    <p className="mt-4 text-sm text-ba-coffee/60">
                      {method.brewTime} · {method.suitableRoast}
                    </p>
                  </div>

                  <div
                    className={`${dsRadius.card} relative overflow-hidden border border-ba-espresso/[0.06] bg-ba-pearl p-6 ${isEven ? "lg:col-start-1 lg:row-start-1" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-ba-espresso/[0.06] pb-4">
                      <span className="text-xs font-medium uppercase tracking-[0.14em] text-ba-coffee/55">
                        Cup profile
                      </span>
                      <span className="text-xs text-ba-coffee/55">{method.difficulty}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      {[
                        { label: "Body", value: method.body },
                        { label: "Acidity", value: method.acidity },
                        { label: "Sweet", value: method.sweetness },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-ba-coffee/50">
                            {label}
                          </p>
                          <p className="font-display mt-1 text-xl text-ba-espresso">{value}/5</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    aria-hidden
                    className="absolute start-6 top-8 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-ba-pearl bg-ba-bronze lg:start-1/2 lg:block"
                  />
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </SectionFrame>
  );
}
