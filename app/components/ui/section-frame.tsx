import type { ReactNode } from "react";
import { layout, sectionPadding, sectionThemes } from "@/lib/constants/styles";
import type { DsSectionTheme } from "@/lib/design-system/tokens";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";

type SectionFrameProps = {
  id: string;
  children: ReactNode;
  className?: string;
  padding?: keyof typeof sectionPadding;
  theme?: DsSectionTheme;
  showDividers?: boolean;
  beforeContent?: ReactNode;
  ariaLabelledBy?: string;
  wide?: boolean;
};

export function SectionFrame({
  id,
  children,
  className = "",
  padding = "standard",
  theme = "light",
  showDividers = false,
  beforeContent,
  ariaLabelledBy,
  wide = false,
}: SectionFrameProps) {
  const isDark = theme === "dark" || theme === "espresso";
  const containerClass = wide ? "relative mx-auto max-w-7xl" : layout.container;

  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`relative ${sectionPadding[padding]} ${sectionThemes[theme]} lg:[content-visibility:auto] lg:[contain-intrinsic-size:auto_500px] ${className}`.trim()}
    >
      {showDividers && (
        <>
          <div aria-hidden className={isDark ? layout.sectionDividerTopDark : layout.sectionDividerTop} />
          {!isDark && <div aria-hidden className={layout.sectionFadeTop} />}
        </>
      )}
      {beforeContent}
      <RevealOnScroll>
        <div className={containerClass}>{children}</div>
      </RevealOnScroll>
    </section>
  );
}
