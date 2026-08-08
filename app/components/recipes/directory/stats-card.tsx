import type { LucideIcon } from "lucide-react";
import {
  rdBorder,
  rdCard,
  rdLayout,
  rdTypography,
} from "@/lib/design-system/recipes-directory";

export type StatsCardItem = {
  icon: LucideIcon;
  value: number | string;
  label: string;
};

type StatsCardProps = {
  items: StatsCardItem[];
  ariaLabel?: string;
  className?: string;
};

function formatStat(value: number | string): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function gridClassForCount(count: number): string {
  if (count <= 2) return "sm:grid-cols-2";
  if (count === 3) return "sm:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

/** Compact multi-stat strip used on Recipes country and roaster pages. */
export function StatsCard({ items, ariaLabel, className = "" }: StatsCardProps) {
  return (
    <section
      aria-label={ariaLabel}
      className={`${rdLayout.container} ${className}`.trim()}
    >
      <div
        className={`grid grid-cols-1 overflow-hidden ${gridClassForCount(items.length)} ${rdCard.panel}`}
      >
        {items.map(({ icon: Icon, value, label }, index) => {
          const display = formatStat(value);
          const compactValue = typeof value === "string" && display.length > 6;

          return (
            <div
              key={label}
              className={`flex items-center gap-4 px-6 py-7 sm:flex-col sm:items-center sm:justify-center sm:gap-3 sm:px-4 sm:py-8 sm:text-center ${
                index > 0 ? `border-t ${rdBorder.dune45} sm:border-t-0 sm:border-s` : ""
              }`}
            >
              <div className={rdCard.iconWell}>
                <Icon className="h-5 w-5 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <p
                  className={`font-display font-bold leading-snug tracking-[-0.03em] text-[#1A1410] ${
                    compactValue
                      ? "text-[1.05rem] sm:text-[1.125rem]"
                      : "text-[1.75rem] leading-none"
                  }`}
                >
                  {display}
                </p>
                <p className={`mt-1.5 ${rdTypography.metaMuted}`}>{label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
