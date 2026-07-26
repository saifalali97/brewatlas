import { BadgeCheck, Shield } from "lucide-react";
import type { RecipeVerificationStatus } from "@/types/official-recipe";

type OfficialRecipeBadgeProps = {
  verificationStatus?: RecipeVerificationStatus;
  versionLabel?: string;
  compact?: boolean;
  /** Softer, lighter badge for dense list rows (use with `compact`). */
  listTone?: boolean;
};

export function OfficialRecipeBadge({
  verificationStatus = "verified",
  versionLabel,
  compact = false,
  listTone = false,
}: OfficialRecipeBadgeProps) {
  const isVerified = verificationStatus === "verified" || verificationStatus === "competition_tested";
  if (!isVerified) return null;

  const label =
    verificationStatus === "competition_tested" ? "Competition Tested" : "Official Recipe";

  const compactClass = listTone
    ? "gap-0.5 rounded-md bg-ac-espresso/[0.05] px-1.5 py-px text-[9px] font-medium uppercase tracking-[0.14em] text-ac-espresso/65"
    : "gap-1 rounded-full bg-ba-bronze/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ba-espresso";

  const iconClass = listTone ? "h-2.5 w-2.5 opacity-70" : "h-3 w-3";

  return (
    <span
      className={`inline-flex items-center ${compact ? compactClass : "gap-1 rounded-full bg-ba-bronze/15 px-2.5 py-1 text-xs font-medium text-ba-espresso"}`}
    >
      {verificationStatus === "competition_tested" ? (
        <Shield className={iconClass} aria-hidden />
      ) : (
        <BadgeCheck className={iconClass} aria-hidden />
      )}
      {label}
      {versionLabel ? ` v${versionLabel}` : ""}
    </span>
  );
}
