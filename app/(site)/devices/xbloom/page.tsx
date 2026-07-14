import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  Clock,
  Cpu,
  Droplets,
  Gauge,
  ListOrdered,
  Scale,
  Thermometer,
  Waves,
  Zap,
} from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { cards, typography } from "@/lib/constants/styles";
import { XBLOOM_DEVICE_MODELS } from "@/types/xbloom";

export const metadata: Metadata = {
  title: "xBloom Recipes",
  description:
    "BrewAtlas recipes support full xBloom brewing profiles — dose, water temperature, pulse pattern, and pour sequence — for xBloom Studio, Original, Lite, and Omni.",
  alternates: {
    canonical: "/devices/xbloom",
  },
};

const deviceBlurbs: Record<(typeof XBLOOM_DEVICE_MODELS)[number], string> = {
  "xBloom Studio":
    "The flagship model with full profile control — dial in dose, pulse pattern, and pour sequence for competition-level precision.",
  "xBloom Original":
    "The original smart dripper. Save a brewing profile once and reproduce the exact same cup every time.",
  "xBloom Lite":
    "A compact, approachable entry point into precision brewing, built for effortless everyday cups.",
  "xBloom Omni":
    "Built for versatility — store multiple brewing profiles and switch between recipes in seconds.",
};

const profileFields = [
  { icon: Scale, label: "Dose", value: "Coffee weight, in grams" },
  { icon: Droplets, label: "Brew Water", value: "Total water, in grams" },
  { icon: Thermometer, label: "Water Temperature", value: "Precise °C target" },
  { icon: Gauge, label: "Grind Setting", value: "Device-specific grind step" },
  { icon: Clock, label: "Bloom Time", value: "Pre-infusion duration" },
  { icon: Activity, label: "Flow Rate", value: "Pour speed, ml/s" },
  { icon: Waves, label: "Pulse Pattern", value: "Pour/pause rhythm" },
  { icon: ListOrdered, label: "Pour Sequence", value: "Ordered pour steps" },
  { icon: Zap, label: "Agitation", value: "Stirring/swirl setting" },
  { icon: Clock, label: "Total Time", value: "Full brew duration" },
];

export default function XBloomPage() {
  return (
    <SectionFrame id="xbloom-listing" ariaLabelledBy="xbloom-listing-heading" padding="compact">
      <Link
        href="/devices"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Brewing Devices
      </Link>

      <PageHeader
        eyebrow="Precision Brewing Integration"
        title="xBloom Recipes"
        description="Any BrewAtlas recipe can carry a full xBloom brewing profile, so your dial-in translates perfectly to the machine — every dose, temperature, and pulse pattern, saved with the recipe."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-6">
        {XBLOOM_DEVICE_MODELS.map((model) => (
          <article key={model} className={`${cards.premiumShell} p-5 lg:p-6`}>
            <div aria-hidden className={cards.premiumSheen} />
            <div aria-hidden className={cards.premiumGlow} />
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-600/25 bg-amber-950/40">
              <Cpu className="h-4 w-4 text-amber-500/85" aria-hidden />
            </div>
            <h3 className="relative mt-4 text-[1.05rem] font-semibold leading-snug tracking-tight text-stone-50">
              {model}
            </h3>
            <p className="relative mt-2 text-[0.8125rem] leading-[1.65] text-stone-300/90">
              {deviceBlurbs[model]}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-16">
        <p className={typography.eyebrow}>Every xBloom Profile Includes</p>
        <h2 className={typography.sectionTitleModern}>What Ships With Every Recipe</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {profileFields.map((field) => (
            <MetaTile key={field.label} icon={field.icon} label={field.label} value={field.value} />
          ))}
        </div>
      </div>

      <div className="mt-14 border-t border-white/[0.06] pt-10">
        <GhostCtaLink href="/recipes" autoWidth>
          Browse Recipes
        </GhostCtaLink>
      </div>
    </SectionFrame>
  );
}
