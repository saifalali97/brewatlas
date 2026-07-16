import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { Clock, Droplets, Flame, Gauge } from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { badges, cards } from "@/lib/constants/styles";
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
  /** Translated label for `method.difficulty`. Defaults to the raw English enum value. */
  difficultyLabel: string;
  /** Translated `{name} {suitableRoast}` image alt template. */
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
        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-stone-500">
          {label}
        </span>
        <span className="text-[9px] tabular-nums text-stone-600">{value}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((segment) => (
          <span
            key={segment}
            className={`h-[5px] flex-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              segment <= value
                ? "bg-gradient-to-r from-uae-warm-gold-deep/70 to-uae-warm-gold/85 group-hover:from-uae-warm-gold-deep/85 group-hover:to-uae-warm-gold group-hover:shadow-[0_0_10px_rgba(192,138,46,0.28)]"
                : "bg-white/[0.07] group-hover:bg-white/[0.11]"
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
  /** Translated copy for this card's chrome. Defaults to English so existing callers (e.g. `/methods`) are unaffected. */
  labels?: Partial<MethodCardLabels>;
};

export function MethodCard({ method, ctaHref = "#methods", labels }: MethodCardProps) {
  const l: MethodCardLabels = { ...defaultMethodCardLabels, ...labels };
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-uae-warm-gold/32 hover:shadow-[0_24px_56px_-18px_rgba(192,138,46,0.24),0_0_0_1px_rgba(192,138,46,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:flex-row lg:items-stretch"
    >
      <div aria-hidden className={cards.premiumSheen} />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-uae-warm-gold/8 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden sm:aspect-[5/3] lg:aspect-auto lg:h-auto lg:min-h-0 lg:w-[46%] lg:self-stretch xl:w-[48%]">
        <OptimizedImage
          src={method.image}
          alt={interpolate(l.imageAltTemplate, { name: method.name, suitableRoast: method.suitableRoast })}
          sizes="(min-width: 1024px) 46vw, 100vw"
          loading="lazy"
          className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705]/95 via-[#0a0705]/35 to-[#0a0705]/12 lg:bg-gradient-to-r lg:from-[#0a0705]/15 lg:via-[#0a0705]/20 lg:to-[#0a0705]/82" />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        <div className={`absolute start-4 top-4 ${badges.accent}`}>
          {method.suitableRoast}
        </div>
      </div>

      <div className="relative flex w-full flex-col self-start p-5 lg:min-w-0 lg:flex-1 lg:p-6">
        <h3 className="font-display text-[1.3rem] leading-[1.15] tracking-[-0.02em] text-stone-50 transition-colors duration-300 group-hover:text-uae-pearl sm:text-[1.35rem] lg:text-[1.4rem]">
          {method.name}
        </h3>
        <p className="mt-2 text-[0.8125rem] leading-[1.65] text-stone-300/90">
          {method.description}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MetaTile icon={Clock} label={l.brewTime} value={method.brewTime} centered />
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
            <Gauge className="h-3.5 w-3.5 shrink-0 text-uae-warm-gold/80" aria-hidden />
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-stone-500">
                {l.difficulty}
              </p>
              <div className="mt-0.5">
                <DifficultyIndicator level={method.difficulty} label={l.difficultyLabel || undefined} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-stone-500">
            <Droplets className="h-3 w-3 text-uae-warm-gold/70" aria-hidden />
            {l.cupProfile}
          </div>
          <TasteBar value={method.body} label={l.body} />
          <TasteBar value={method.acidity} label={l.acidity} />
          <TasteBar value={method.sweetness} label={l.sweetness} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-stone-500">
          <Flame className="h-3 w-3 text-uae-warm-gold/70" aria-hidden />
          <span>
            {l.bestWith}{" "}
            <strong className="font-medium text-stone-300">{method.suitableRoast}</strong>
          </span>
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <GhostCtaLink href={ctaHref} autoWidth>
            {l.learnMethod}
          </GhostCtaLink>
        </div>
      </div>
    </article>
  );
}
