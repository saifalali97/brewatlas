"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { SubscriptionStatusBadge } from "@/app/components/subscription/subscription-status-badge";
import { buttons } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import {
  cancelSubscription,
  createBillingPortalAction,
  createCheckoutSessionAction,
  type MembershipActionState,
} from "@/lib/supabase/membership-actions";
import type { Dictionary } from "@/lib/i18n/types";
import type { MembershipSummary } from "@/types/membership";

type SubscriptionPanelProps = {
  membership: MembershipSummary;
  dictionary: Dictionary;
  stripeEnabled: boolean;
  checkoutMessage?: string | null;
  errorMessage?: string | null;
  locale: string;
};

function formatDate(value: string | null, locale: string): string | null {
  if (!value) return null;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(value));
}

export function SubscriptionPanel({
  membership,
  dictionary,
  stripeEnabled,
  checkoutMessage,
  errorMessage,
  locale,
}: SubscriptionPanelProps) {
  const labels = dictionary.subscriptionPage;
  const [cancelState, cancelAction, cancelPending] = useActionState<MembershipActionState, FormData>(
    cancelSubscription,
    undefined,
  );

  const expiresLabel = formatDate(membership.expiresAt, locale);
  const intervalLabel =
    membership.billingInterval === "year"
      ? labels.intervalYearly
      : membership.billingInterval === "month"
        ? labels.intervalMonthly
        : null;

  const showManagePortal = stripeEnabled && Boolean(membership.stripeCustomerId);
  const showUpgrade = !membership.isPremium || membership.cancelAtPeriodEnd;
  const showCancel =
    membership.isPremium && !membership.cancelAtPeriodEnd && membership.status !== "canceled";

  return (
    <div className="space-y-8">
      {(checkoutMessage || errorMessage || cancelState?.error || cancelState?.success) && (
        <FormMessage
          error={cancelState?.error ?? errorMessage ?? undefined}
          success={cancelState?.success ?? checkoutMessage ?? undefined}
        />
      )}

      <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.035] p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">{labels.currentPlanLabel}</p>
            <p className="mt-2 text-2xl font-semibold capitalize tracking-tight text-stone-50">{membership.plan}</p>
            {intervalLabel && <p className="mt-1 text-sm text-stone-500">{intervalLabel}</p>}
          </div>
          <SubscriptionStatusBadge
            status={membership.status}
            isPremium={membership.isPremium}
            dictionary={dictionary}
          />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {membership.trial.isTrialing && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">{labels.trialRemainingLabel}</dt>
              <dd className="mt-1 text-sm text-stone-200">
                {interpolate(labels.trialDaysRemainingTemplate, { days: membership.trial.daysRemaining })}
              </dd>
            </div>
          )}
          {expiresLabel && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                {membership.cancelAtPeriodEnd ? labels.accessUntilLabel : labels.renewsOnLabel}
              </dt>
              <dd className="mt-1 text-sm text-stone-200">{expiresLabel}</dd>
            </div>
          )}
          {membership.cancelAtPeriodEnd && (
            <div className="sm:col-span-2">
              <p className="text-sm text-amber-300/90">{labels.cancelScheduledNote}</p>
            </div>
          )}
          {membership.status === "past_due" && (
            <div className="sm:col-span-2">
              <p className="text-sm text-rose-300/90">{labels.pastDueNote}</p>
            </div>
          )}
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        {showUpgrade && stripeEnabled && (
          <form action={createCheckoutSessionAction}>
            <input type="hidden" name="interval" value={membership.billingInterval ?? "month"} />
            <input type="hidden" name="returnPath" value="/account/subscription" />
            <button type="submit" className={buttons.primary}>
              {membership.trial.eligible ? labels.startTrialCta : labels.upgradeCta}
            </button>
          </form>
        )}

        {showManagePortal && (
          <form action={createBillingPortalAction}>
            <button type="submit" className={buttons.secondary}>
              {labels.manageBillingCta}
            </button>
          </form>
        )}

        {showCancel && (
          <form action={cancelAction}>
            <button type="submit" disabled={cancelPending} className={buttons.secondary}>
              {cancelPending ? labels.cancelingCta : labels.cancelCta}
            </button>
          </form>
        )}
      </div>

      {!stripeEnabled && (
        <p className="text-sm text-stone-500">{labels.manualBillingNote}</p>
      )}
    </div>
  );
}
