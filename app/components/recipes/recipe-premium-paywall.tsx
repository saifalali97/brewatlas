import Link from "next/link";
import { Lock } from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";

type RecipePremiumPaywallProps = {
  dictionary: Dictionary;
  isAuthenticated: boolean;
  recipeSlug: string;
};

export function RecipePremiumPaywall({ dictionary, isAuthenticated, recipeSlug }: RecipePremiumPaywallProps) {
  const d = dictionary.recipeDetail;
  const loginHref = `/login?redirectTo=${encodeURIComponent(`/recipes/${recipeSlug}`)}`;
  const ctaHref = isAuthenticated ? "/premium" : loginHref;
  const ctaLabel = isAuthenticated ? d.unlockFullGuide : d.signInToUnlock;

  return (
    <div className="relative mt-12 overflow-hidden rounded-[1.5rem] border border-amber-600/25 bg-gradient-to-b from-amber-950/35 via-[#0a0705]/90 to-[#0a0705] p-8 text-center shadow-[0_24px_64px_-24px_rgba(180,120,60,0.35)] sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-600/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-600/30 bg-amber-950/50 text-amber-400/90">
          <Lock className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-stone-50 sm:text-2xl">{d.premiumPreviewTitle}</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-400 sm:text-base">{d.premiumPreviewDescription}</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <RippleLink href={ctaHref} className={`${buttons.primary} w-full sm:w-auto`}>
            {ctaLabel}
          </RippleLink>
          {!isAuthenticated && (
            <Link href="/premium" className={`${buttons.secondary} w-full sm:w-auto`}>
              {d.viewPremiumPlans}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
