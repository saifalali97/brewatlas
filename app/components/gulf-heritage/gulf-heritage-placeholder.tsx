import { acTypography } from "@/lib/design-system/atlas-canon";
import { surfaces } from "@/lib/constants/styles";

type GulfHeritagePlaceholderProps = {
  title: string;
  description: string;
};

/** Placeholder panel for Gulf Heritage pages awaiting editorial content. */
export function GulfHeritagePlaceholder({ title, description }: GulfHeritagePlaceholderProps) {
  return (
    <div className={`mt-10 px-8 py-14 text-center ${surfaces.lightPanel}`}>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-ac-espresso">{title}</p>
      <p className={`${acTypography.body} mx-auto mt-4 max-w-lg`}>{description}</p>
    </div>
  );
}
