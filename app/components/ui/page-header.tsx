import { layout, typography } from "@/lib/constants/styles";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
};

/** Consistent standalone-page header, reusing the same section typography tokens as the homepage. */
export function PageHeader({
  eyebrow,
  title,
  description,
  centered = true,
}: PageHeaderProps) {
  return (
    <div className={centered ? layout.introBlockCentered : layout.introBlock}>
      <p className={typography.eyebrow}>{eyebrow}</p>
      <h1 className={typography.sectionTitleModern}>{title}</h1>
      {description && (
        <p className={centered ? typography.sectionLeadCentered : typography.sectionLead}>
          {description}
        </p>
      )}
    </div>
  );
}
