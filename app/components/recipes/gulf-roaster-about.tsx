import { SectionTitle } from "@/app/components/recipes/directory";
import { rdCard, rdLayout } from "@/lib/design-system/recipes-directory";

type GulfRoasterAboutProps = {
  title: string;
  description: string;
};

/** Long-form about panel for a Gulf roaster page. */
export function GulfRoasterAbout({ title, description }: GulfRoasterAboutProps) {
  return (
    <section aria-labelledby="gulf-roaster-about-heading" className={rdLayout.container}>
      <div className={`${rdCard.panel} px-6 py-8 sm:px-8 sm:py-10`}>
        <SectionTitle id="gulf-roaster-about-heading">{title}</SectionTitle>
        <p className="mt-4 max-w-3xl text-[1rem] leading-[1.8] text-[#1A1410]/65">
          {description}
        </p>
      </div>
    </section>
  );
}
