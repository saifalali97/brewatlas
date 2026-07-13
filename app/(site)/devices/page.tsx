import type { Metadata } from "next";
import Image from "next/image";
import { Clock, Flame, Gauge } from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { cards } from "@/lib/constants/styles";
import { brewMethods } from "@/data/homepage";
import { imageAlt } from "@/lib/seo/image-alt";

export const metadata: Metadata = {
  title: "Brewing Devices",
  description:
    "A guide to the brewing devices behind every BrewAtlas method — from the V60 dripper to the siphon set — with the roast level and difficulty each pairs best with.",
  alternates: {
    canonical: "/devices",
  },
};

const deviceNameByMethod: Record<string, string> = {
  "Pour Over": "V60 Dripper",
  Espresso: "Espresso Machine",
  "French Press": "French Press",
  Aeropress: "AeroPress",
  "Cold Brew": "Cold Brew Tower",
  Siphon: "Siphon Brewer",
};

export default function DevicesPage() {
  return (
    <SectionFrame id="devices-listing" ariaLabelledBy="devices-listing-heading" padding="compact">
      <PageHeader
        eyebrow="Brew Gear Guide"
        title="Brewing Devices"
        description="The equipment behind every BrewAtlas method, matched to the roast level and skill it brews best."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {brewMethods.map((method) => {
          const deviceName = deviceNameByMethod[method.name] ?? method.name;

          return (
            <article key={method.name} className={cards.premiumShell}>
              <div aria-hidden className={cards.premiumSheen} />
              <div aria-hidden className={cards.premiumGlow} />

              <div className="relative h-40 shrink-0 overflow-hidden sm:h-44 lg:h-48">
                <Image
                  src={method.image}
                  alt={imageAlt.brewingMethod(deviceName, method.suitableRoast)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  unoptimized={method.image.endsWith(".svg")}
                  className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
                />
                <div className={cards.imageOverlay} />
                <div className={cards.imageAmberWash} />
                <div className={cards.imageRadial} />

                <div className="absolute left-4 top-4 rounded-full border border-amber-600/30 bg-[#0a0705]/60 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-amber-200/90 backdrop-blur-xl">
                  {method.suitableRoast}
                </div>
              </div>

              <div className="relative flex flex-1 flex-col p-5 lg:p-6">
                <h3 className="text-[1.2rem] font-semibold leading-[1.15] tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-50 lg:text-[1.25rem]">
                  {deviceName}
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-[1.65] text-stone-300/90">
                  Used for {method.name.toLowerCase()} brewing. {method.description}
                </p>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <MetaTile icon={Clock} label="Brew Time" value={method.brewTime} />
                  <MetaTile icon={Flame} label="Best Roast" value={method.suitableRoast} />
                </div>

                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
                  <Gauge className="h-3.5 w-3.5 shrink-0 text-amber-500/80" aria-hidden />
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-stone-500">
                      Difficulty
                    </p>
                    <div className="mt-0.5">
                      <DifficultyIndicator level={method.difficulty} />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </SectionFrame>
  );
}
