import { acTypography } from "@/lib/design-system/atlas-canon";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
  /** Required when the page section uses `aria-labelledby` — must match that id. */
  headingId?: string;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Consistent standalone-page header with accessible h1 id support. */
export function PageHeader({
  eyebrow,
  title,
  description,
  centered = true,
  headingId,
}: PageHeaderProps) {
  return (
    <div className={joinClasses(centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl", "mb-14 md:mb-16")}>
      <p className={acTypography.eyebrow}>{eyebrow}</p>
      <h1 id={headingId} className={joinClasses(acTypography.displayLg, "mt-6")}>
        {title}
      </h1>
      {description ? (
        <p className={joinClasses(acTypography.body, "mt-6", centered && "mx-auto max-w-2xl")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
