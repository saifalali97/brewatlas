"use client";

import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";

const filters = ["All", "V60", "Espresso", "Chemex", "Aeropress", "Cold Brew"] as const;

export type MethodFilter = (typeof filters)[number];

export const methodFilters = filters;

export type MethodIndexLabelKey =
  | "homeFilters.all"
  | "homeFilters.v60"
  | "homeFilters.espresso"
  | "homeFilters.chemex"
  | "homeFilters.aeropress"
  | "homeFilters.coldBrew";

export const methodFilterLabelKeys: Record<MethodFilter, MethodIndexLabelKey> = {
  All: "homeFilters.all",
  V60: "homeFilters.v60",
  Espresso: "homeFilters.espresso",
  Chemex: "homeFilters.chemex",
  Aeropress: "homeFilters.aeropress",
  "Cold Brew": "homeFilters.coldBrew",
};

type MethodIndexProps = {
  activeFilter: MethodFilter;
  onFilterChange: (filter: MethodFilter) => void;
  getLabel: (key: MethodIndexLabelKey) => string;
  filterByAria: (filter: string) => string;
};

/** Text-based method index — editorial navigation, not pill chips. */
export function MethodIndex({
  activeFilter,
  onFilterChange,
  getLabel,
  filterByAria,
}: MethodIndexProps) {
  return (
    <nav aria-label="Recipe methods" className="mt-10 border-b border-ac-espresso/[0.08] pb-3 sm:mt-14 sm:pb-4">
      <ul className="flex flex-wrap gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          const label = getLabel(methodFilterLabelKeys[filter]);
          return (
            <li key={filter}>
              <button
                type="button"
                aria-label={filterByAria(label)}
                aria-pressed={isActive}
                onClick={() => onFilterChange(filter)}
                className={[
                  acTypography.nav,
                  "relative inline-flex min-h-11 items-center px-1 py-2 transition-all duration-300 touch-manipulation active:scale-[0.98]",
                  isActive
                    ? "text-ac-espresso after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-ac-copper"
                    : "text-ac-espresso/75 hover:text-ba-bronze",
                  acFocus.ring,
                ].join(" ")}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
