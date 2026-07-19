import { badges } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";
import type { SubscriptionStatus } from "@/types/membership";

type SubscriptionStatusBadgeProps = {
  status: SubscriptionStatus;
  isPremium: boolean;
  dictionary: Dictionary;
  className?: string;
};

function statusLabel(status: SubscriptionStatus, dictionary: Dictionary): string {
  const labels = dictionary.subscriptionPage;
  switch (status) {
    case "trialing":
      return labels.statusTrialing;
    case "active":
      return labels.statusActive;
    case "past_due":
      return labels.statusPastDue;
    case "canceled":
      return labels.statusCanceled;
    case "expired":
      return labels.statusExpired;
    default:
      return labels.statusActive;
  }
}

export function SubscriptionStatusBadge({ status, isPremium, dictionary, className = "" }: SubscriptionStatusBadgeProps) {
  if (!isPremium && status === "active") return null;

  const tone =
    status === "past_due"
      ? "border-rose-600/25 bg-rose-50 text-ac-espresso"
      : status === "trialing"
        ? "border-sky-600/30 bg-sky-50 text-ac-espresso"
        : status === "canceled" || status === "expired"
          ? "border-ba-espresso/15 bg-ba-sand/40 text-ac-espresso"
          : "border-ba-gold/35 bg-ba-gold/12 text-ac-espresso";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${tone} ${className}`}
    >
      {statusLabel(status, dictionary)}
    </span>
  );
}

export function PremiumMemberBadge({ dictionary, className = "" }: { dictionary: Dictionary; className?: string }) {
  return (
    <span className={`${badges.premiumCompact} ${className}`}>
      {dictionary.publicProfilePage.premiumMemberBadge}
    </span>
  );
}
