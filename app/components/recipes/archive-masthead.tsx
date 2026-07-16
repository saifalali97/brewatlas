"use client";

import { Search } from "lucide-react";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";

type ArchiveMastheadProps = {
  headingId: string;
  issueLabel: string;
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Issue-style archive header with editorial underline search. */
export function ArchiveMasthead({
  headingId,
  issueLabel,
  title,
  description,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: ArchiveMastheadProps) {
  return (
    <header className="max-w-4xl">
      <p className={acTypography.eyebrow}>{issueLabel}</p>
      <h1 id={headingId} className={joinClasses(acTypography.displayLg, "mt-6")}>
        {title}
      </h1>
      <p className={joinClasses(acTypography.bodyLg, "mt-6 max-w-2xl")}>{description}</p>

      <div className="mt-12 max-w-lg">
        <label htmlFor="archive-recipe-search" className="sr-only">
          {searchLabel}
        </label>
        <div className="flex items-center gap-3 border-b border-ac-espresso/[0.12] pb-3 transition-colors duration-300 focus-within:border-ac-copper/50">
          <Search className="h-4 w-4 shrink-0 text-ac-walnut/55" aria-hidden />
          <input
            id="archive-recipe-search"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className={joinClasses(
              "w-full bg-transparent py-1 text-sm text-ac-espresso outline-none placeholder:text-ac-walnut/45",
              acFocus.ringInset,
            )}
          />
        </div>
      </div>
    </header>
  );
}
