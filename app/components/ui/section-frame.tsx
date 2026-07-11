import type { ReactNode } from "react";
import { layout, sectionPadding } from "@/lib/constants/styles";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";

type SectionFrameProps = {
  id: string;
  children: ReactNode;
  className?: string;
  padding?: keyof typeof sectionPadding;
  showDividers?: boolean;
  beforeContent?: ReactNode;
  ariaLabelledBy?: string;
};

export function SectionFrame({
  id,
  children,
  className = "",
  padding = "standard",
  showDividers = true,
  beforeContent,
  ariaLabelledBy,
}: SectionFrameProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`relative ${sectionPadding[padding]} [content-visibility:auto] [contain-intrinsic-size:auto_500px] ${className}`.trim()}
    >
      {showDividers && (
        <>
          <div aria-hidden className={layout.sectionDividerTop} />
          <div aria-hidden className={layout.sectionFadeTop} />
        </>
      )}
      {beforeContent}
      <RevealOnScroll>
        <div className={layout.container}>{children}</div>
      </RevealOnScroll>
    </section>
  );
}
