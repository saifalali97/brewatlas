import type { ReactNode } from "react";
import {
  acGrid,
  acSectionPadding,
  acSectionRhythm,
  type AcSectionRhythm,
} from "@/lib/design-system/atlas-canon";
import { motionPassageClass } from "@/lib/design-system/motion";

type ChapterPadding = keyof typeof acSectionPadding;

export type ChapterProps = {
  id: string;
  children: ReactNode;
  /** Atlas Canon tonal mode — Night, Dawn, Sand, Day, Dusk */
  rhythm?: AcSectionRhythm;
  className?: string;
  padding?: ChapterPadding;
  wide?: boolean;
  ariaLabelledBy?: string;
  beforeContent?: ReactNode;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Full-width editorial chapter — tonal section with Atlas Canon rhythm.
 * Replaces card-based section templates for journey-based layouts.
 */
export function Chapter({
  id,
  children,
  rhythm = "dawn",
  className = "",
  padding = "chapter",
  wide = false,
  ariaLabelledBy,
  beforeContent,
}: ChapterProps) {
  const containerClass = wide ? acGrid.containerWide : acGrid.container;

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={joinClasses(
        "relative",
        acSectionPadding[padding],
        acSectionRhythm[rhythm],
        motionPassageClass,
        className,
      )}
    >
      {beforeContent}
      <div className={containerClass}>{children}</div>
    </section>
  );
}
