import type { SubscriptionStatus } from "@/types/membership";
import type { Dictionary } from "@/lib/i18n/types";

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
      ? "border-rose-600/35 bg-rose-950/40 text-rose-200/90"
      : status === "trialing"
        ? "border-sky-600/35 bg-sky-950/40 text-sky-200/90"
        : status === "canceled" || status === "expired"
          ? "border-stone-500/35 bg-stone-900/60 text-stone-300"
          : "border-amber-600/35 bg-amber-950/45 text-amber-200/90";

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
    <span
      className={`inline-flex items-center rounded-full border border-amber-600/35 bg-amber-950/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200/90 ${className}`}
    >
      {dictionary.publicProfilePage.premiumMemberBadge}
    </span>
  );
}
