import type { Dictionary } from "@/lib/i18n/types";
import type { ReviewModerationStatus } from "@/types/community";

type OwnerReviewStatusBadgeProps = {
  status: ReviewModerationStatus;
  labels: Dictionary["ownerReviewsPage"];
};

const statusStyles: Record<ReviewModerationStatus, string> = {
  visible: "border-emerald-600/30 bg-emerald-950/30 text-emerald-200/90",
  hidden: "border-stone-500/30 bg-stone-900/50 text-stone-300",
  flagged: "border-amber-600/35 bg-amber-950/35 text-amber-200/90",
};

export function OwnerReviewStatusBadge({ status, labels }: OwnerReviewStatusBadgeProps) {
  const label =
    status === "visible" ? labels.statusVisible : status === "hidden" ? labels.statusHidden : labels.statusFlagged;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyles[status]}`}>
      {label}
    </span>
  );
}
