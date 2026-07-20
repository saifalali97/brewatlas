import { BadgeCheck, Shield } from "lucide-react";
import type { RecipeVerificationStatus } from "@/types/official-recipe";

type OfficialRecipeBadgeProps = {
  verificationStatus?: RecipeVerificationStatus;
  versionLabel?: string;
  compact?: boolean;
};

export function OfficialRecipeBadge({
  verificationStatus = "verified",
  versionLabel,
  compact = false,
}: OfficialRecipeBadgeProps) {
  const isVerified = verificationStatus === "verified" || verificationStatus === "competition_tested";
  if (!isVerified) return null;

  const label =
    verificationStatus === "competition_tested" ? "Competition Tested" : "Official Recipe";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-ba-bronze/15 text-ba-espresso ${
        compact ? "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" : "px-2.5 py-1 text-xs font-medium"
      }`}
    >
      {verificationStatus === "competition_tested" ? (
        <Shield className="h-3 w-3" aria-hidden />
      ) : (
        <BadgeCheck className="h-3 w-3" aria-hidden />
      )}
      {label}
      {versionLabel ? ` v${versionLabel}` : ""}
    </span>
  );
}
