import type { ReactNode } from "react";
import { Chapter } from "@/app/components/atlas/chapter";
import { acLegacySectionThemeMap } from "@/lib/design-system/atlas-canon";
import type { DsSectionTheme } from "@/lib/design-system/tokens";

type SectionFrameProps = {
  id: string;
  children: ReactNode;
  className?: string;
  padding?: "standard" | "compact" | "hero";
  theme?: DsSectionTheme;
  showDividers?: boolean;
  beforeContent?: ReactNode;
  ariaLabelledBy?: string;
  wide?: boolean;
};

const paddingMap = {
  standard: "chapter",
  compact: "standard",
  hero: "hero",
} as const;

/** Atlas Canon chapter wrapper — backward-compatible alias for legacy SectionFrame usage. */
export function SectionFrame({
  id,
  children,
  className = "",
  padding = "standard",
  theme = "light",
  beforeContent,
  ariaLabelledBy,
  wide = false,
}: SectionFrameProps) {
  const rhythm = acLegacySectionThemeMap[theme] ?? "dawn";

  return (
    <Chapter
      id={id}
      rhythm={rhythm}
      padding={paddingMap[padding]}
      wide={wide}
      ariaLabelledBy={ariaLabelledBy}
      beforeContent={beforeContent}
      className={className}
    >
      {children}
    </Chapter>
  );
}
