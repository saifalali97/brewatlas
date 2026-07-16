import { layout, typography } from "@/lib/constants/styles";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  /** Required when the page section uses `aria-labelledby` — must match that id. */
  headingId?: string;
};

/** Consistent standalone-page header with accessible h1 id support. */
export function PageHeader({
  eyebrow,
  title,
  description,
  centered = true,
  headingId,
}: PageHeaderProps) {
  return (
    <div className={centered ? layout.introBlockCentered : layout.introBlock}>
      <p className={typography.eyebrow}>{eyebrow}</p>
      <h1 id={headingId} className={typography.sectionTitleModern}>
        {title}
      </h1>
      {description ? (
        <p className={centered ? typography.sectionLeadCentered : typography.sectionLead}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
