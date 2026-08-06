import { acTypography } from "@/lib/design-system/atlas-canon";
import type { GulfDirectoryRoaster } from "@/lib/data/gulf-directory";

type RoasteryAboutSectionProps = {
  roaster: GulfDirectoryRoaster;
  title: string;
  websiteLabel: string;
  instagramLabel: string;
};

/** Optional compact roastery profile — kept near the bottom of roastery pages. */
export function RoasteryAboutSection({
  roaster,
  title,
  websiteLabel,
  instagramLabel,
}: RoasteryAboutSectionProps) {
  if (!roaster.description && !roaster.website && !roaster.instagram) {
    return null;
  }

  const location = [roaster.city, roaster.emirate, roaster.country].filter(Boolean).join(", ");

  return (
    <section
      aria-labelledby="roastery-about-heading"
      className="mt-16 border-t border-ac-espresso/[0.08] pt-10 sm:mt-20 sm:pt-12"
    >
      <h2 id="roastery-about-heading" className={acTypography.h2}>
        {title}
      </h2>
      {location ? <p className={`mt-2 ${acTypography.folioMeta}`}>{location}</p> : null}
      {roaster.description ? (
        <p className={`mt-4 max-w-3xl ${acTypography.body} leading-[1.75] text-ac-espresso/85`}>
          {roaster.description}
        </p>
      ) : null}
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {roaster.website ? (
          <a
            href={roaster.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ac-espresso underline-offset-4 hover:text-ba-bronze hover:underline"
          >
            {websiteLabel}
          </a>
        ) : null}
        {roaster.instagram ? (
          <a
            href={roaster.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ac-espresso underline-offset-4 hover:text-ba-bronze hover:underline"
          >
            {instagramLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
