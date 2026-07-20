"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Chapter } from "@/app/components/atlas/chapter";
import { EditorialFaq } from "@/app/components/atlas/editorial-faq";
import { Invitation } from "@/app/components/atlas/invitation";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { MotionReveal } from "@/lib/design-system/motion";
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

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function PremiumCtaButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className={joinClasses(
        "inline-flex h-12 items-center justify-center rounded-full border border-ac-gold/40 px-10 text-sm font-medium tracking-[0.08em] uppercase text-ac-pearl hover:border-ac-gold/60 hover:bg-white/[0.04]",
        acFocus.ringDark,
      )}
    >
      {children}
    </button>
  );
}

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
  const featuredTestimonial = content.testimonials[0];

  const premiumPrice =
    interval === "year" ? labels.premiumYearlyPrice : labels.premiumMonthlyPrice;
  const premiumPeriod = interval === "year" ? labels.perYearLabel : labels.perMonthLabel;

  const premiumCta =
    membership?.isPremium && !membership.cancelAtPeriodEnd
      ? labels.manageSubscriptionCta
      : membership?.trial.eligible
        ? labels.startTrialCta
        : labels.subscribeCta;

  const showStripeCheckout =
    stripeEnabled &&
    isAuthenticated &&
    premiumPlan &&
    !(membership?.isPremium && !membership.cancelAtPeriodEnd);

  const premiumHref =
    membership?.isPremium && !membership.cancelAtPeriodEnd
      ? "/account/subscription"
      : isAuthenticated
        ? "/premium"
        : `/login?redirectTo=${encodeURIComponent("/premium")}`;

  const trialNote =
    membership?.trial.eligible && stripeEnabled
      ? labels.trialIncludedNote
      : membership?.trial.isTrialing
        ? labels.trialActiveNote
        : null;

  const invitationProse = (
    <>
      <p>{dictionary.homePricing.description}</p>
      {premiumPlan ? (
        <div className="mt-8">
          <p className={acTypography.eyebrowDark}>{premiumPlan.name}</p>
          <p className="mt-4 font-display text-5xl tracking-[-0.03em] text-ac-pearl sm:text-6xl">
            {premiumPrice}
            <span className="ms-2 text-lg text-ac-sand/60">/{premiumPeriod}</span>
          </p>
          <p className="mt-4 text-ac-sand/75">{premiumPlan.description}</p>
        </div>
      ) : null}
      {premiumPlan?.features.map((feature) => (
        <p key={feature} className="text-ac-sand/80">
          {feature}
        </p>
      ))}
      {featuredTestimonial ? (
        <figure className="mt-8 border-t border-white/[0.08] pt-10">
          <blockquote className="font-display text-xl leading-[1.4] tracking-[-0.02em] text-ac-pearl sm:text-2xl">
            &ldquo;{featuredTestimonial.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6">
            <p className="font-medium text-ac-pearl">{featuredTestimonial.name}</p>
            <p className="mt-1 text-sm text-ac-sand/65">
              {featuredTestimonial.role} · {featuredTestimonial.location}
            </p>
          </figcaption>
        </figure>
      ) : null}
      {freePlan ? (
        <p className="text-ac-sand/65">
          {freePlan.name} — {freePlan.description}{" "}
          <Link
            href="/login"
            className={joinClasses(acTypography.nav, "text-ac-gold hover:text-ac-pearl", acFocus.ringDark)}
          >
            {freePlan.cta} →
          </Link>
        </p>
      ) : null}
      {teamPlan ? (
        <p className="text-ac-sand/65">
          {teamPlan.name} — {teamPlan.description}{" "}
          <Link
            href="/contact"
            className={joinClasses(acTypography.nav, "text-ac-gold hover:text-ac-pearl", acFocus.ringDark)}
          >
            {teamPlan.cta} →
          </Link>
        </p>
      ) : null}
    </>
  );

  const billingToggle = stripeEnabled ? (
    <div className="ac-prose-width mx-auto mt-10 flex flex-col items-center gap-4">
      <div
        className="inline-flex rounded-full border border-white/[0.12] p-1"
        role="group"
        aria-label={labels.billingIntervalAriaLabel}
      >
        <button
          type="button"
          onClick={() => setInterval("month")}
          aria-pressed={interval === "month"}
          className={joinClasses(
            "min-h-11 rounded-full px-5 py-2 text-sm font-medium transition-colors",
            acFocus.ringDark,
            interval === "month" ? "bg-ac-gold text-ac-espresso" : "text-ac-sand/70 hover:text-ac-pearl",
          )}
        >
          {labels.monthlyToggle}
        </button>
        <button
          type="button"
          onClick={() => setInterval("year")}
          aria-pressed={interval === "year"}
          className={joinClasses(
            "min-h-11 rounded-full px-5 py-2 text-sm font-medium transition-colors",
            acFocus.ringDark,
            interval === "year" ? "bg-ac-gold text-ac-espresso" : "text-ac-sand/70 hover:text-ac-pearl",
          )}
        >
          {labels.yearlyToggle}
        </button>
      </div>
      {interval === "year" ? <p className="text-sm text-ac-gold/90">{labels.premiumYearlySavings}</p> : null}
      {trialNote ? <p className="text-sm text-ac-sand/65">{trialNote}</p> : null}
    </div>
  ) : null;

  const invitation = (
    <Invitation
      eyebrow={dictionary.homePricing.eyebrow}
      title={dictionary.homePricing.title}
      prose={invitationProse}
      ctaHref={showStripeCheckout ? undefined : premiumHref}
      ctaLabel={showStripeCheckout ? undefined : premiumCta}
      secondaryHref="/recipes"
      secondaryLabel={dictionary.homeFooter.browseRecipes}
      primaryAction={showStripeCheckout ? <PremiumCtaButton>{premiumCta}</PremiumCtaButton> : undefined}
    />
  );

  return (
    <>
      <Chapter id="premium-circle" rhythm="night" padding="standard" ariaLabelledBy="premium-plans-heading">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(196,165,116,0.12),transparent)]"
        />

        <MotionReveal>
          <div className="relative mx-auto mb-12 aspect-[21/9] max-w-4xl overflow-hidden rounded-sm">
            <OptimizedImage
              src={PAGE_EDITORIAL_IMAGES.premium}
              alt=""
              fill
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover object-center opacity-90"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ac-espresso/60 via-ac-espresso/20 to-transparent" />
          </div>
          {showStripeCheckout ? (
            <form action={createCheckoutSessionAction}>
              <input type="hidden" name="interval" value={interval} />
              <input type="hidden" name="returnPath" value="/premium" />
              {invitation}
            </form>
          ) : (
            invitation
          )}
          {billingToggle}
        </MotionReveal>
      </Chapter>

      <Chapter id="premium-faq" rhythm="dawn" padding="compact" ariaLabelledBy="premium-faq-heading">
        <div className="mx-auto max-w-2xl text-center">
          <p className={acTypography.eyebrow}>{dictionary.homeFaq.eyebrow}</p>
          <h2 id="premium-faq-heading" className={joinClasses(acTypography.h1, "mt-5")}>
            {dictionary.homePricing.membershipQuestionsTitle}
          </h2>
        </div>
        <div className="mx-auto mt-10 max-w-2xl">
          <EditorialFaq faqs={content.faqs} headingId="premium-faq-heading" />
        </div>
      </Chapter>
    </>
  );
}
