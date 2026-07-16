"use client";

import type { ReactNode } from "react";
import { acMotion } from "@/lib/design-system/atlas-canon";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Scroll-reveal wrapper — content always visible (SSR-safe).
 * Applies subtle one-shot entrance animation; never opacity-0 on first paint.
 */
export function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: RevealOnScrollProps) {
  return (
    <div
      className={[
        "opacity-100 translate-y-0",
        acMotion.reduce,
        "motion-safe:animate-[ac-reveal-up_900ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none",
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
