"use client";

import { useState } from "react";
import { PricingCard } from "@/app/components/cards/pricing-card";
import { FaqAccordion } from "@/app/components/ui/faq-accordion";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { typography, dsFocus } from "@/lib/constants/styles";
import { createCheckoutSessionAction } from "@/lib/supabase/membership-actions";
import type { Dictionary } from "@/lib/i18n/types";
import type { HomeContent } from "@/types/homepage";
import type { MembershipSummary } from "@/types/membership";

type PremiumPricingSectionProps = {
  dictionary: Dictionary;
  content: HomeContent;
  membership: MembershipSummary | null;
  stripeEnabled: boolean;
  isAuthenticated: boolean;
};

const pricingCardLabels = (dictionary: Dictionary) => ({
  mostPopular: dictionary.homePricing.mostPopular,
  recipes: dictionary.homePricing.recipesLabel,
  access: dictionary.homePricing.accessLabel,
  offlineAccess: dictionary.homePricing.offlineAccessLabel,
  favorites: dictionary.homePricing.favoritesLabel,
  aiRecommendations: dictionary.homePricing.aiRecommendationsLabel,
  brewTracking: dictionary.homePricing.brewTrackingLabel,
  prioritySupport: dictionary.homePricing.prioritySupportLabel,
});

export function PremiumPricingSection({
  dictionary,
  content,
  membership,
  stripeEnabled,
  isAuthenticated,
}: PremiumPricingSectionProps) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const labels = dictionary.subscriptionPage;
  const [freePlan, premiumPlan, teamPlan] = content.pricingPlans;
  const cardLabels = pricingCardLabels(dictionary);

  const premiumPlanWithPrice = premiumPlan
    ? {
        ...premiumPlan,
        price: interval === "year" ? labels.premiumYearlyPrice : labels.premiumMonthlyPrice,
        period: interval === "year" ? labels.perYearLabel : labels.perMonthLabel,
        cta:
          membership?.isPremium && !membership.cancelAtPeriodEnd
            ? labels.manageSubscriptionCta
            : membership?.trial.eligible
              ? labels.startTrialCta
              : labels.subscribeCta,
      }
    : null;

  const showStripeCheckout =
    stripeEnabled && isAuthenticated && premiumPlanWithPrice && !(membership?.isPremium && !membership.cancelAtPeriodEnd);

  const trialNote =
    membership?.trial.eligible && stripeEnabled
      ? labels.trialIncludedNote
      : membership?.trial.isTrialing
        ? labels.trialActiveNote
        : null;

  return (
    <>
      <SectionFrame id="premium-plans" ariaLabelledBy="premium-plans-heading" padding="compact">
<PageHeader headingId="premium-plans-heading"
          eyebrow={dictionary.homePricing.eyebrow}
          title={dictionary.homePricing.title}
          description={dictionary.homePricing.description}
        />

        {stripeEnabled && (
          <div className="mx-auto mb-10 flex max-w-md items-center justify-center">
            <div
              className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.04] p-1"
              role="group"
              aria-label={labels.billingIntervalAriaLabel}
            >
              <button
                type="button"
                onClick={() => setInterval("month")}
                aria-pressed={interval === "month"}
                className={`min-h-11 rounded-full px-5 py-2 text-sm font-medium transition-colors ${dsFocus.ring} ${
                  interval === "month"
                    ? "bg-uae-warm-gold text-uae-dark-coffee-deep shadow-[0_0_24px_rgba(192,138,46,0.35)]"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {labels.monthlyToggle}
              </button>
              <button
                type="button"
                onClick={() => setInterval("year")}
                aria-pressed={interval === "year"}
                className={`min-h-11 rounded-full px-5 py-2 text-sm font-medium transition-colors ${dsFocus.ring} ${
                  interval === "year"
                    ? "bg-uae-warm-gold text-uae-dark-coffee-deep shadow-[0_0_24px_rgba(192,138,46,0.35)]"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {labels.yearlyToggle}
              </button>
            </div>
          </div>
        )}

        {interval === "year" && stripeEnabled && (
          <p className="-mt-6 mb-8 text-center text-sm text-uae-warm-gold/90">{labels.premiumYearlySavings}</p>
        )}

        {trialNote && <p className="mb-8 text-center text-sm text-stone-400">{trialNote}</p>}

        <div className="grid items-stretch gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {freePlan && <PricingCard plan={freePlan} ctaHref="/login" labels={cardLabels} />}

          {premiumPlanWithPrice &&
            (showStripeCheckout ? (
              <form action={createCheckoutSessionAction} className="contents">
                <input type="hidden" name="interval" value={interval} />
                <input type="hidden" name="returnPath" value="/premium" />
                <PricingCard plan={premiumPlanWithPrice} ctaAsSubmit labels={cardLabels} />
              </form>
            ) : (
              <PricingCard
                plan={premiumPlanWithPrice}
                ctaHref={
                  membership?.isPremium && !membership.cancelAtPeriodEnd
                    ? "/account/subscription"
                    : isAuthenticated
                      ? "/premium"
                      : `/login?redirectTo=${encodeURIComponent("/premium")}`
                }
                labels={cardLabels}
              />
            ))}

          {teamPlan && <PricingCard plan={teamPlan} ctaHref="/contact" labels={cardLabels} />}
        </div>
      </SectionFrame>

      <SectionFrame id="premium-faq" ariaLabelledBy="premium-faq-heading" padding="compact" className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-2xl text-center">
          <p className={typography.eyebrow}>{dictionary.homeFaq.eyebrow}</p>
          <h2 id="premium-faq-heading" className={typography.sectionTitleModern}>
            {dictionary.homePricing.membershipQuestionsTitle}
          </h2>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <FaqAccordion faqs={content.faqs} headingId="premium-faq-heading" />
        </div>
      </SectionFrame>
    </>
  );
}
