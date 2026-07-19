import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { Clock, Droplets, Flame, Gauge } from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { badges, cards, dsRadius } from "@/lib/constants/styles";
import type { BrewingMethod } from "@/types/homepage";
import { interpolate } from "@/lib/i18n/format";
import { imageAlt } from "@/lib/seo/image-alt";

export type MethodCardLabels = {
  brewTime: string;
  difficulty: string;
  cupProfile: string;
  body: string;
  acidity: string;
  sweetness: string;
  bestWith: string;
  learnMethod: string;
  difficultyLabel: string;
  imageAltTemplate: string;
};

const defaultMethodCardLabels: MethodCardLabels = {
  brewTime: "Brew Time",
  difficulty: "Difficulty",
  cupProfile: "Cup Profile",
  body: "Body",
  acidity: "Acidity",
  sweetness: "Sweetness",
  bestWith: "Best with",
  learnMethod: "Learn Method",
  difficultyLabel: "",
  imageAltTemplate: imageAlt.brewingMethodTemplate,
};

function TasteBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-ac-espresso">{label}</span>
        <span className="text-[9px] tabular-nums text-ac-espresso">{value}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((segment) => (
          <span
            key={segment}
            className={`h-[5px] flex-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              segment <= value
                ? "bg-gradient-to-r from-ba-bronze/70 to-ba-gold/85 group-hover:from-ba-bronze/85 group-hover:to-ba-gold"
                : "bg-ba-espresso/[0.06] group-hover:bg-ba-espresso/[0.1]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

type MethodCardProps = {
  method: BrewingMethod;
  ctaHref?: string;
  labels?: Partial<MethodCardLabels>;
};

export function MethodCard({ method, ctaHref = "#methods", labels }: MethodCardProps) {
  const l: MethodCardLabels = { ...defaultMethodCardLabels, ...labels };
  return (
    <article
      className={`${cards.premiumShell} lg:flex-row lg:items-stretch`}
    >
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-[5/3] lg:aspect-auto lg:h-auto lg:min-h-0 lg:w-[46%] lg:self-stretch xl:w-[48%]">
        <OptimizedImage
          src={method.image}
          alt={interpolate(l.imageAltTemplate, { name: method.name, suitableRoast: method.suitableRoast })}
          sizes="(min-width: 1024px) 46vw, 100vw"
          loading="lazy"
          className={`${cards.cardPhoto} saturate-[0.96] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none`}
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        <div className={`absolute start-4 top-4 ${badges.accent}`}>{method.suitableRoast}</div>
      </div>

      <div className="relative flex w-full flex-col self-start p-5 lg:min-w-0 lg:flex-1 lg:p-6">
        <h3 className="font-display text-[1.3rem] leading-[1.15] tracking-[-0.02em] text-ba-espresso transition-colors duration-300 group-hover:text-ba-bronze sm:text-[1.35rem] lg:text-[1.4rem]">
          {method.name}
        </h3>
        <p className="mt-2 text-[0.8125rem] leading-[1.65] text-ac-espresso">{method.description}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MetaTile icon={Clock} label={l.brewTime} value={method.brewTime} centered />
          <div className={`flex items-center gap-2.5 ${dsRadius.md} border border-ba-espresso/[0.06] bg-ba-sand/30 px-3 py-2.5`}>
            <Gauge className="h-3.5 w-3.5 shrink-0 text-ac-espresso" aria-hidden />
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-ac-espresso">{l.difficulty}</p>
              <div className="mt-0.5">
                <DifficultyIndicator level={method.difficulty} label={l.difficultyLabel || undefined} />
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-4 space-y-2.5 ${dsRadius.md} border border-ba-espresso/[0.06] bg-ba-sand/20 p-3`}>
          <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-ac-espresso">
            <Droplets className="h-3 w-3 text-ac-espresso" aria-hidden />
            {l.cupProfile}
          </div>
          <TasteBar value={method.body} label={l.body} />
          <TasteBar value={method.acidity} label={l.acidity} />
          <TasteBar value={method.sweetness} label={l.sweetness} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-ac-espresso">
          <Flame className="h-3 w-3 text-ac-espresso" aria-hidden />
          <span>
            {l.bestWith}{" "}
            <strong className="font-medium text-ba-espresso">{method.suitableRoast}</strong>
          </span>
        </div>

        <div className="mt-4 border-t border-ba-espresso/[0.06] pt-4">
          <GhostCtaLink href={ctaHref} autoWidth>
            {l.learnMethod}
          </GhostCtaLink>
        </div>
      </div>
    </article>
  );
}
