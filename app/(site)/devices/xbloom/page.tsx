import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
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
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { XBLOOM_DEVICE_MODELS } from "@/types/xbloom";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/devices/xbloom",
    locale,
    title: dictionary.metadata.xbloomTitle,
    description: dictionary.metadata.xbloomDescription,
  });
}

function deviceBlurbKey(model: (typeof XBLOOM_DEVICE_MODELS)[number]): keyof Dictionary["xbloomPage"] {
  switch (model) {
    case "xBloom Studio":
      return "deviceBlurbStudio";
    case "xBloom Original":
      return "deviceBlurbOriginal";
    case "xBloom Lite":
      return "deviceBlurbLite";
    case "xBloom Omni":
      return "deviceBlurbOmni";
  }
}

export default async function XBloomPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.xbloomPage;

  const profileFields = [
    { icon: Scale, label: p.fieldDoseLabel, value: p.fieldDoseValue },
    { icon: Droplets, label: p.fieldBrewWaterLabel, value: p.fieldBrewWaterValue },
    { icon: Thermometer, label: p.fieldWaterTempLabel, value: p.fieldWaterTempValue },
    { icon: Gauge, label: p.fieldGrindLabel, value: p.fieldGrindValue },
    { icon: Clock, label: p.fieldBloomLabel, value: p.fieldBloomValue },
    { icon: Activity, label: p.fieldFlowLabel, value: p.fieldFlowValue },
    { icon: Waves, label: p.fieldPulseLabel, value: p.fieldPulseValue },
    { icon: ListOrdered, label: p.fieldPourLabel, value: p.fieldPourValue },
    { icon: Zap, label: p.fieldAgitationLabel, value: p.fieldAgitationValue },
    { icon: Clock, label: p.fieldTotalTimeLabel, value: p.fieldTotalTimeValue },
  ];

  return (
    <SectionFrame id="xbloom-listing" ariaLabelledBy="xbloom-listing-heading" padding="compact">
      
<Link
        href="/devices"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {p.backToDevices}
      </Link>

      <PageHeader headingId="xbloom-listing-heading" eyebrow={p.eyebrow} title={p.title} description={p.description} />

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
              {p[deviceBlurbKey(model)]}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-16">
        <p className={typography.eyebrow}>{p.everyProfileEyebrow}</p>
        <h2 className={typography.sectionTitleModern}>{p.whatShipsTitle}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {profileFields.map((field) => (
            <MetaTile key={field.label} icon={field.icon} label={field.label} value={field.value} />
          ))}
        </div>
      </div>

      <div className="mt-14 border-t border-white/[0.06] pt-10">
        <GhostCtaLink href="/recipes" autoWidth>
          {dictionary.homeFooter.browseRecipes}
        </GhostCtaLink>
      </div>
    </SectionFrame>
  );
}
