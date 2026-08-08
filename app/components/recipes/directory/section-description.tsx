import type { ReactNode } from "react";
import { rdTypography } from "@/lib/design-system/recipes-directory";

type SectionDescriptionProps = {
  children: ReactNode;
  className?: string;
  /** CTA panels use slightly more top margin. */
  tone?: "section" | "cta";
};

/** Recipes directory supporting copy under a section title. */
export function SectionDescription({
  children,
  className = "",
  tone = "section",
}: SectionDescriptionProps) {
  const toneClass =
    tone === "cta" ? rdTypography.ctaDescription : rdTypography.sectionDescription;

  return <p className={`${toneClass} ${className}`.trim()}>{children}</p>;
}
