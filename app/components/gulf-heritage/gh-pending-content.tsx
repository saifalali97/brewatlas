import { acTypography } from "@/lib/design-system/atlas-canon";

type GhPendingContentProps = {
  message: string;
};

/** Styled pending placeholder for unverified editorial slots. */
export function GhPendingContent({ message }: GhPendingContentProps) {
  return (
    <p className={`${acTypography.body} text-sm leading-relaxed text-ac-espresso/65 italic`}>{message}</p>
  );
}
