import type { ReactNode } from "react";
import { forms } from "@/lib/constants/styles";
import { rdCard, rdTypography } from "@/lib/design-system/recipes-directory";

export type FilterBarOption = {
  value: string;
  label: string;
};

export type FilterBarField = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterBarOption[];
  anyLabel: string;
};

type FilterBarProps = {
  ariaLabel: string;
  fields?: FilterBarField[];
  children?: ReactNode;
  className?: string;
};

const selectClass = `${forms.select} mt-1.5`;

/** Shared Recipes directory filter shell (select grid or custom children). */
export function FilterBar({
  ariaLabel,
  fields,
  children,
  className = "",
}: FilterBarProps) {
  return (
    <div
      role="search"
      aria-label={ariaLabel}
      className={`${rdCard.filter} ${className}`.trim()}
    >
      {fields
        ? fields.map((field) => (
            <label key={field.id} className={rdTypography.filterLabel}>
              {field.label}
              <select
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                className={selectClass}
              >
                <option value="">{field.anyLabel}</option>
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))
        : children}
    </div>
  );
}
