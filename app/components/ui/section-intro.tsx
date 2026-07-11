import { layout, typography } from "@/lib/constants/styles";

type SectionIntroProps = {
  eyebrow: string;
  title: string;
  headingId?: string;
  description?: string;
  descriptionClassName?: string;
  centered?: boolean;
  titleVariant?: "modern" | "legacy";
};

export function SectionIntro({
  eyebrow,
  title,
  headingId,
  description,
  descriptionClassName,
  centered = false,
  titleVariant = "modern",
}: SectionIntroProps) {
  const titleClass =
    titleVariant === "legacy" ? typography.sectionTitleLegacy : typography.sectionTitleModern;
  const leadClass =
    descriptionClassName ??
    (centered ? typography.sectionLeadCentered : typography.sectionLead);

  return (
    <div className={centered ? layout.introBlockCentered : layout.introBlock}>
      <p className={typography.eyebrow}>{eyebrow}</p>
      <h2 id={headingId} className={titleClass}>
        {title}
      </h2>
      {description && <p className={leadClass}>{description}</p>}
    </div>
  );
}
