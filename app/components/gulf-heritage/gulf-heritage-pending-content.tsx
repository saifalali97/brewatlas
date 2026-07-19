import { acTypography } from "@/lib/design-system/atlas-canon";

type GulfHeritagePendingContentProps = {
  message: string;
};

/** Standard placeholder for unverified Gulf Heritage editorial content. */
export function GulfHeritagePendingContent({ message }: GulfHeritagePendingContentProps) {
  return <p className={acTypography.body}>{message}</p>;
}
