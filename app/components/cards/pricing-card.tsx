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
import { cards } from "@/lib/constants/styles";
import type { PricingPlan } from "@/types/homepage";

function FeatureValue({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <Check className="h-3.5 w-3.5 text-amber-500/90" aria-hidden />
  ) : (
    <X className="h-3.5 w-3.5 text-stone-600" aria-hidden />
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
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] py-2.5 last:border-b-0">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-3.5 w-3.5 shrink-0 text-amber-500/75" aria-hidden />
        <span className="text-[0.8125rem] text-stone-400">{label}</span>
      </div>
      {value !== undefined ? (
        <span className="shrink-0 text-[0.8125rem] font-medium text-stone-200">{value}</span>
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
}: {
  href: string;
  highlighted: boolean;
  children: ReactNode;
}) {
  return (
    <RippleLink
      href={href}
      className={`group/btn relative isolate inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-full px-5 text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] motion-reduce:hover:translate-y-0 ${
        highlighted
          ? "bg-amber-600 text-white shadow-[0_0_32px_rgba(217,119,6,0.3)] hover:-translate-y-1 hover:bg-amber-500 hover:shadow-[0_0_44px_rgba(217,119,6,0.45)]"
          : "border border-white/[0.12] bg-white/[0.06] text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl hover:-translate-y-1 hover:border-amber-500/45 hover:bg-white/[0.1] hover:shadow-[0_0_36px_rgba(217,119,6,0.18),inset_0_1px_0_rgba(255,255,255,0.14)]"
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-500 ease-out group-hover/btn:translate-x-full motion-reduce:transition-none"
      />
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
};

export function PricingCard({ plan, ctaHref = "#pricing" }: PricingCardProps) {
  const highlighted = Boolean(plan.highlighted);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        highlighted
          ? "z-10 border-amber-600/35 bg-gradient-to-b from-amber-950/45 via-white/[0.04] to-[#0a0705]/85 shadow-[0_28px_64px_-20px_rgba(180,120,60,0.28),0_0_0_1px_rgba(217,119,6,0.12)] hover:border-amber-500/45 hover:shadow-[0_36px_72px_-18px_rgba(180,120,60,0.34),0_0_48px_rgba(217,119,6,0.12)] lg:scale-[1.04] lg:-my-3"
          : "border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] hover:border-amber-500/28 hover:shadow-[0_24px_56px_-18px_rgba(180,120,60,0.2),0_0_0_1px_rgba(217,119,6,0.06)]"
      }`}
    >
      <div aria-hidden className={cards.premiumSheen} />
      {highlighted && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-[1.5rem] bg-gradient-to-b from-amber-500/20 via-transparent to-transparent opacity-70"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-600/12 blur-3xl"
          />
        </>
      )}

      {highlighted && (
        <div className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-amber-500/40 bg-amber-600 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_0_28px_rgba(217,119,6,0.4)]">
          Most Popular
        </div>
      )}

      <div className={`relative flex flex-1 flex-col ${highlighted ? "p-6 lg:p-8" : "p-5 lg:p-6"}`}>
        <h3 className="text-[1.15rem] font-semibold tracking-tight text-stone-50 lg:text-[1.2rem]">
          {plan.name}
        </h3>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span
            className={`font-semibold tracking-tight text-stone-50 ${
              highlighted ? "text-4xl lg:text-[2.75rem]" : "text-3xl lg:text-4xl"
            }`}
          >
            {plan.price}
          </span>
          {plan.price !== "$0" && (
            <span className="text-sm text-stone-500">/{plan.period}</span>
          )}
        </div>
        {plan.price === "$0" && (
          <span className="mt-1 text-sm text-stone-500">{plan.period}</span>
        )}

        <p className="mt-4 text-[0.8125rem] leading-[1.65] text-stone-300/90">
          {plan.description}
        </p>

        <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5">
          <PlanFeature icon={BookOpen} label="Recipes" value={plan.recipeCount} />
          <PlanFeature icon={Shield} label="Access" value={plan.accessLevel} />
          <PlanFeature
            icon={plan.offlineAccess ? Wifi : WifiOff}
            label="Offline access"
            booleanValue={plan.offlineAccess}
          />
          <PlanFeature icon={Heart} label="Favorites" value={plan.favorites} />
          <PlanFeature
            icon={Sparkles}
            label="AI recommendations"
            booleanValue={plan.aiRecommendations}
          />
          <PlanFeature icon={Coffee} label="Brew tracking" value={plan.brewTracking} />
          <PlanFeature
            icon={Headphones}
            label="Priority support"
            booleanValue={plan.prioritySupport}
          />
        </div>

        <ul className="mt-5 flex-1 space-y-2.5">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-[0.8125rem] leading-relaxed text-stone-400"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/85" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-2">
          <PricingButton href={ctaHref} highlighted={highlighted}>
            {plan.cta}
          </PricingButton>
        </div>
      </div>
    </article>
  );
}
