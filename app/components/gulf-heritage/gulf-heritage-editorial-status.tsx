import { badges } from "@/lib/constants/styles";
import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";

type GulfHeritageEditorialStatusProps = {
  status: GulfHeritageEditorialStatus;
  labels: Record<GulfHeritageEditorialStatus, string>;
};

/** Editorial status badge for Gulf Heritage pages. */
export function GulfHeritageEditorialStatusBadge({ status, labels }: GulfHeritageEditorialStatusProps) {
  return (
    <span className={`${badges.premiumCompact} mt-4 inline-flex`}>{labels[status]}</span>
  );
}
