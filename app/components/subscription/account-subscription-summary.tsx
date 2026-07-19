import Link from "next/link";
import { SubscriptionStatusBadge } from "@/app/components/subscription/subscription-status-badge";
import { buttons, surfaces } from "@/lib/constants/styles";
import { isStripeBillingEnabled } from "@/lib/billing/billing-adapter";
import { createBillingPortalAction } from "@/lib/supabase/membership-actions";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import type { MembershipSummary } from "@/types/membership";

type AccountSubscriptionSummaryProps = {
  membership: MembershipSummary;
  dictionary: Dictionary;
  locale: string;
};

function formatDate(value: string | null, locale: string): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export function AccountSubscriptionSummary({ membership, dictionary, locale }: AccountSubscriptionSummaryProps) {
  const labels = dictionary.subscriptionPage;
  const stripeEnabled = isStripeBillingEnabled();
  const expiresLabel = formatDate(membership.expiresAt, locale);
  const intervalLabel =
    membership.billingInterval === "year"
      ? labels.intervalYearly
      : membership.billingInterval === "month"
        ? labels.intervalMonthly
        : labels.freePlanInterval;

  return (
    <div className={`mt-10 p-6 sm:p-8 ${surfaces.lightPanel}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ac-espresso">{labels.accountSummaryEyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ac-espresso">{labels.accountSummaryTitle}</h2>
        </div>
        <Link href="/account/subscription" className="text-sm font-medium text-ac-espresso underline-offset-4 hover:underline">
          {labels.viewDetailsCta}
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-ba-espresso/06 pt-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso">{labels.currentPlanLabel}</p>
          <p className="mt-1 text-lg font-semibold capitalize text-ac-espresso">{membership.plan}</p>
        </div>
        <SubscriptionStatusBadge status={membership.status} isPremium={membership.isPremium} dictionary={dictionary} />
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso">{labels.billingCycleLabel}</dt>
          <dd className="mt-1 text-sm text-ac-espresso">{intervalLabel}</dd>
        </div>
        {expiresLabel && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso">
              {membership.cancelAtPeriodEnd ? labels.accessUntilLabel : labels.renewsOnLabel}
            </dt>
            <dd className="mt-1 text-sm text-ac-espresso">{expiresLabel}</dd>
          </div>
        )}
        {membership.trial.isTrialing && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-[0.12em] text-ac-espresso">{labels.trialRemainingLabel}</dt>
            <dd className="mt-1 text-sm text-ac-espresso">
              {interpolate(labels.trialDaysRemainingTemplate, { days: membership.trial.daysRemaining })}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        {!membership.isPremium || membership.cancelAtPeriodEnd ? (
          <Link href="/premium" className={buttons.primary}>
            {membership.trial.eligible ? labels.startTrialCta : labels.upgradeCta}
          </Link>
        ) : null}

        {stripeEnabled && membership.stripeCustomerId && (
          <form action={createBillingPortalAction}>
            <button type="submit" className={buttons.secondary}>
              {labels.manageSubscriptionCta}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
