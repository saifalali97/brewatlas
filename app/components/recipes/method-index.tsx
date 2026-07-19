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
    <nav aria-label="Recipe methods" className="mt-14 border-b border-ac-espresso/[0.08] pb-4">
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
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
                  "relative pb-1 transition-colors duration-300",
                  isActive
                    ? "text-ac-espresso after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ac-copper"
                    : "text-ac-espresso hover:text-ba-bronze",
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
