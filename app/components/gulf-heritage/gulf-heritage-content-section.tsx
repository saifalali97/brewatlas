import { acTypography } from "@/lib/design-system/atlas-canon";
import { surfaces } from "@/lib/constants/styles";

type GulfHeritageContentSectionProps = {
  title: string;
  children: React.ReactNode;
};

/** Section block for Gulf Heritage article and roaster pages. */
export function GulfHeritageContentSection({ title, children }: GulfHeritageContentSectionProps) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-tight text-ac-espresso sm:text-2xl">{title}</h2>
      <div className={`${surfaces.lightPanelCompact} mt-4 px-6 py-5`}>
        <div className={`${acTypography.body} text-ac-espresso`}>{children}</div>
      </div>
    </section>
  );
}
