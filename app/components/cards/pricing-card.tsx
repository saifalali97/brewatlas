import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Coffee,
  Headphones,
  Heart,
  Shield,
  Sparkles,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons, cards, dsRadius } from "@/lib/constants/styles";
import type { PricingPlan } from "@/types/homepage";

export type PricingCardLabels = {
  mostPopular: string;
  recipes: string;
  access: string;
  offlineAccess: string;
  favorites: string;
  aiRecommendations: string;
  brewTracking: string;
  prioritySupport: string;
};

const defaultPricingCardLabels: PricingCardLabels = {
  mostPopular: "Most Popular",
  recipes: "Recipes",
  access: "Access",
  offlineAccess: "Offline access",
  favorites: "Favorites",
  aiRecommendations: "AI recommendations",
  brewTracking: "Brew tracking",
  prioritySupport: "Priority support",
};

function FeatureValue({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Check className="h-3.5 w-3.5 text-ba-bronze" aria-hidden />
  ) : (
    <X className="h-3.5 w-3.5 text-ba-coffee/35" aria-hidden />
  );
}

function PlanFeature({
  icon: Icon,
  label,
  value,
  booleanValue,
}: {
  icon: typeof BookOpen;
  label: string;
  value?: string;
  booleanValue?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ba-espresso/[0.06] py-2.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-3.5 w-3.5 shrink-0 text-ba-bronze/85" aria-hidden />
        <span className="text-[0.8125rem] text-ba-coffee/70">{label}</span>
      </div>
      {value !== undefined ? (
        <span className="shrink-0 text-[0.8125rem] font-medium text-ba-espresso">{value}</span>
      ) : (
        <FeatureValue enabled={Boolean(booleanValue)} />
      )}
    </div>
  );
}

function PricingButton({
  href,
  highlighted,
  children,
  asSubmit = false,
}: {
  href?: string;
  highlighted: boolean;
  children: ReactNode;
  asSubmit?: boolean;
}) {
  const className = `group/btn relative isolate inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] motion-reduce:hover:translate-y-0 ${
    highlighted
      ? `${buttons.primary} h-11 min-w-0 hover:-translate-y-1`
      : `${buttons.secondary} h-11 min-w-0 hover:-translate-y-1`
  }`;

  if (asSubmit) {
    return (
      <button type="submit" className={className}>
        <span className="relative">{children}</span>
        <ArrowRight
          className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 motion-reduce:transform-none"
          aria-hidden
        />
      </button>
    );
  }

  return (
    <RippleLink href={href ?? "#pricing"} className={className}>
      <span className="relative">{children}</span>
      <ArrowRight
        className="relative h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 motion-reduce:transform-none"
        aria-hidden
      />
    </RippleLink>
  );
}

type PricingCardProps = {
  plan: PricingPlan;
  ctaHref?: string;
  ctaAsSubmit?: boolean;
  labels?: Partial<PricingCardLabels>;
};

export function PricingCard({ plan, ctaHref = "#pricing", ctaAsSubmit = false, labels }: PricingCardProps) {
  const l: PricingCardLabels = { ...defaultPricingCardLabels, ...labels };
  const highlighted = Boolean(plan.highlighted);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden ${dsRadius.card} border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        highlighted
          ? "z-10 border-ba-gold/35 bg-ba-pearl shadow-[0_28px_64px_-20px_rgba(184,149,107,0.2)] ring-1 ring-ba-gold/15 lg:-my-3 lg:scale-[1.04]"
          : cards.premiumShell
      }`}
    >
      <div aria-hidden className={cards.premiumSheen} />
      {highlighted && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ba-gold/12 blur-3xl"
        />
      )}

      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-ba-gold/40 bg-ba-gold px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ba-espresso shadow-[0_0_28px_rgba(184,149,107,0.25)]">
          {l.mostPopular}
        </div>
      )}

      <div className={`relative flex flex-1 flex-col ${highlighted ? "p-6 lg:p-8" : "p-5 lg:p-6"}`}>
        <h3 className="font-display text-[1.15rem] tracking-[-0.02em] text-ba-espresso lg:text-[1.2rem]">
          {plan.name}
        </h3>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span
            className={`font-semibold tracking-tight text-ba-espresso ${
              highlighted ? "text-4xl lg:text-[2.75rem]" : "text-3xl lg:text-4xl"
            }`}
          >
            {plan.price}
          </span>
          {plan.price !== "$0" && <span className="text-sm text-ba-coffee/55">/{plan.period}</span>}
        </div>
        {plan.price === "$0" && <span className="mt-1 text-sm text-ba-coffee/55">{plan.period}</span>}

        <p className="mt-4 text-[0.8125rem] leading-[1.65] text-ba-coffee/75">{plan.description}</p>

        <div className={`mt-5 ${dsRadius.md} border border-ba-espresso/[0.06] bg-ba-sand/25 px-3.5`}>
          <PlanFeature icon={BookOpen} label={l.recipes} value={plan.recipeCount} />
          <PlanFeature icon={Shield} label={l.access} value={plan.accessLevel} />
          <PlanFeature
            icon={plan.offlineAccess ? Wifi : WifiOff}
            label={l.offlineAccess}
            booleanValue={plan.offlineAccess}
          />
          <PlanFeature icon={Heart} label={l.favorites} value={plan.favorites} />
          <PlanFeature icon={Sparkles} label={l.aiRecommendations} booleanValue={plan.aiRecommendations} />
          <PlanFeature icon={Coffee} label={l.brewTracking} value={plan.brewTracking} />
          <PlanFeature icon={Headphones} label={l.prioritySupport} booleanValue={plan.prioritySupport} />
        </div>

        <ul className="mt-5 flex-1 space-y-2.5">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-ba-coffee/70">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ba-bronze" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-2">
          <PricingButton href={ctaHref} highlighted={highlighted} asSubmit={ctaAsSubmit}>
            {plan.cta}
          </PricingButton>
        </div>
      </div>
    </article>
  );
}
