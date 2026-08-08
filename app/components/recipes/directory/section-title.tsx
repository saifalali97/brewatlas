import type { ReactNode } from "react";
import { rdTypography } from "@/lib/design-system/recipes-directory";

type SectionTitleProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

/** Recipes directory section heading. */
export function SectionTitle({
  id,
  children,
  className = "",
  as: Tag = "h2",
}: SectionTitleProps) {
  return (
    <Tag id={id} className={`${rdTypography.sectionTitle} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
