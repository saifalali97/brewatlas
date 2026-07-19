import { acTypography } from "@/lib/design-system/atlas-canon";

type GulfHeritageVerifiedRecipeNoticeProps = {
  message: string;
};

/** Shown when a recipe lacks verified source metadata. */
export function GulfHeritageVerifiedRecipeNotice({ message }: GulfHeritageVerifiedRecipeNoticeProps) {
  return <p className={`${acTypography.body} mt-2 text-ac-espresso`}>{message}</p>;
}
