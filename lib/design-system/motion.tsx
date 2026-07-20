import type { ReactNode } from "react";
import { acMotion } from "@/lib/design-system/atlas-canon";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** When true, applies subtle entrance animation. Content is always visible. */
  animate?: boolean;
};

/**
 * Storytelling scroll reveal — content visible by default (SSR-safe).
 * Optional one-shot entrance animation via CSS; never hides content.
 */
export function MotionReveal({
  children,
  className = "",
  delay = 0,
  animate = true,
}: MotionRevealProps) {
  return (
    <div
      className={[
        "opacity-100 translate-y-0",
        acMotion.reduce,
        animate
          ? "motion-safe:animate-[ac-reveal-up_900ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/** Class string for chapter boundary crossfade transitions. */
export const motionPassageClass =
  "motion-safe:transition-[background-color,color] motion-safe:duration-[1200ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

/** Class string for atlas route line draw (SVG stroke-dashoffset animation). */
export const motionAtlasDrawClass =
  "motion-safe:[stroke-dashoffset:0] motion-safe:transition-[stroke-dashoffset] motion-safe:duration-[1600ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]";
