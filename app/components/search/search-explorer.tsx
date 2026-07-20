"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { SearchFiltersPanel } from "@/app/components/search/search-filters";
import { SearchResultsView } from "@/app/components/search/search-results";
import { SearchSkeleton } from "@/app/components/search/search-skeleton";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { forms, dsFocus } from "@/lib/constants/styles";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useTranslations } from "@/lib/i18n/translation-context";
import { countActiveFilters, serializeSearchFilters } from "@/lib/search/params";
import {
  SEARCH_CATEGORIES,
  SEARCH_SORTS,
  type SearchCategory,
  type SearchFilterOptions,
  type SearchFilters,
  type SearchResults,
  type SearchSort,
} from "@/types/search";

type SearchExplorerProps = {
  initialFilters: SearchFilters;
  filterOptions: SearchFilterOptions;
  results: SearchResults;
  favoritedRecipeIds: string[];
  isAuthenticated: boolean;
};

const categoryLabelKeys = {
  all: "searchPage.categoryAll",
  recipes: "searchPage.categoryRecipes",
  roasters: "searchPage.categoryRoasters",
  origins: "searchPage.categoryOrigins",
  devices: "searchPage.categoryDevices",
  varieties: "searchPage.categoryVarieties",
  flavors: "searchPage.categoryFlavors",
} as const satisfies Record<SearchCategory, `searchPage.${string}`>;

const sortLabelKeys = {
  popular: "searchPage.sortPopular",
  rated: "searchPage.sortRated",
  newest: "searchPage.sortNewest",
  fastest: "searchPage.sortFastest",
  alphabetical: "searchPage.sortAlphabetical",
  official: "searchPage.sortOfficial",
} as const satisfies Record<SearchSort, `searchPage.${string}`>;

export function SearchExplorer({
  initialFilters,
  filterOptions,
  results,
  favoritedRecipeIds,
  isAuthenticated,
}: SearchExplorerProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [query, setQuery] = useState(initialFilters.q);
  const debouncedQuery = useDebouncedValue(query, 300);
  const lastNavigatedRef = useRef(serializeSearchFilters(initialFilters).toString());

  if (initialFilters.q !== query && debouncedQuery === initialFilters.q) {
    setQuery(initialFilters.q);
  }

  const navigate = useCallback(
    (nextFilters: SearchFilters) => {
      const params = serializeSearchFilters(nextFilters);
      const nextString = params.toString();
      if (nextString === lastNavigatedRef.current) return;
      lastNavigatedRef.current = nextString;
      const href = nextString ? `${pathname}?${nextString}` : pathname;
      startTransition(() => {
        router.replace(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  const patchFilters = useCallback(
    (patch: Partial<SearchFilters>) => {
      navigate({ ...initialFilters, ...patch, q: debouncedQuery });
    },
    [debouncedQuery, initialFilters, navigate],
  );

  useEffect(() => {
    if (debouncedQuery === initialFilters.q) return;
    navigate({ ...initialFilters, q: debouncedQuery, page: 1 });
  }, [debouncedQuery, initialFilters, navigate]);

  const clearFilters = () => {
    navigate({
      ...initialFilters,
      country: "",
      region: "",
      originId: "",
      roasterId: "",
      roastLevel: "",
      process: "",
      brewingMethodId: "",
      deviceId: "",
      grinderId: "",
      difficulty: "",
      brewTimeMax: "",
      tastingNotes: "",
      tagId: "",
      doseMin: "",
      doseMax: "",
      waterMin: "",
      waterMax: "",
      tempMin: "",
      tempMax: "",
      premiumOnly: false,
      featuredOnly: false,
      recipeKind: "",
      verificationStatus: "",
      verifiedOnly: false,
      page: 1,
      q: debouncedQuery,
    });
  };

  const totalPages = Math.max(1, Math.ceil(results.totalRecipes / results.pageSize));
  const showPagination = initialFilters.category === "recipes" && totalPages > 1;

  return (
    <div>
      <div className="mb-8">
        <label htmlFor="global-search" className="sr-only">
          {t("searchPage.searchAriaLabel")}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ac-espresso"
            aria-hidden
          />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPage.searchPlaceholder")}
            className={`${forms.input} mt-0 min-h-[3.25rem] rounded-2xl py-4 ps-12 pe-5 text-base backdrop-blur-xl`}
            autoComplete="off"
          />
          {(isPending || query !== debouncedQuery) && (
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-xs text-ac-espresso" aria-live="polite">
              {t("searchPage.searching")}
            </span>
          )}
        </div>
      </div>

      <nav aria-label={t("searchPage.categoryAll")} className="mb-6 border-b border-ac-espresso/[0.08] pb-4">
        <ul className="flex flex-wrap gap-x-6 gap-y-3">
          {SEARCH_CATEGORIES.map((category) => {
            const isActive = initialFilters.category === category;
            return (
              <li key={category}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => patchFilters({ category, page: 1 })}
                  className={[
                    acTypography.nav,
                    "relative pb-1 transition-colors duration-300",
                    isActive
                      ? "text-ac-espresso after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ac-copper"
                      : "text-ac-espresso hover:text-ac-espresso",
                    acFocus.ring,
                  ].join(" ")}
                >
                  {t(categoryLabelKeys[category])}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
        {(initialFilters.category === "all" || initialFilters.category === "recipes") && (
          <div className="flex items-center gap-2">
            <label htmlFor="search-sort" className="text-sm text-ac-espresso">
              {t("searchPage.sortLabel")}
            </label>
            <select
              id="search-sort"
              value={initialFilters.sort}
              onChange={(event) => patchFilters({ sort: event.target.value as SearchSort, page: 1 })}
              className={`${forms.select} mt-0 min-w-[10rem]`}
            >
              {SEARCH_SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {t(sortLabelKeys[sort])}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <SearchFiltersPanel
        filters={initialFilters}
        options={filterOptions}
        onChange={(next) => navigate({ ...next, q: debouncedQuery })}
        onClear={clearFilters}
        variant="sheet"
        open={mobileFiltersOpen}
        onOpenChange={setMobileFiltersOpen}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
        <SearchFiltersPanel
          filters={initialFilters}
          options={filterOptions}
          onChange={(next) => navigate({ ...next, q: debouncedQuery })}
          onClear={clearFilters}
          variant="sidebar"
        />

        <div className="min-w-0">
          {(initialFilters.category === "all" || initialFilters.category === "recipes") &&
            (initialFilters.q || countActiveFilters(initialFilters) > 0) && (
              <p className="mb-4 text-sm text-ac-espresso" aria-live="polite">
                {t("searchPage.resultsCount", { count: results.totalRecipes })}
              </p>
            )}

          {countActiveFilters(initialFilters) === 0 && !initialFilters.q && initialFilters.category === "all" ? (
            <div className="mb-8 border-b border-ac-espresso/[0.08] pb-10 text-center">
              <p className={acTypography.body}>{t("searchPage.emptyPrompt")}</p>
            </div>
          ) : null}

          {isPending ? (
            <SearchSkeleton />
          ) : (
            <SearchResultsView
              results={results}
              favoritedRecipeIds={favoritedRecipeIds}
              isAuthenticated={isAuthenticated}
              showAllSections={initialFilters.category === "all"}
            />
          )}

          {showPagination && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={initialFilters.page <= 1}
                onClick={() => patchFilters({ page: Math.max(1, initialFilters.page - 1) })}
                className={`min-h-11 rounded-full border border-ba-espresso/[0.12] px-4 py-2 text-sm text-ac-espresso transition-colors enabled:hover:border-ba-gold/30 enabled:hover:text-ba-espresso disabled:opacity-40 ${dsFocus.ring}`}
              >
                {t("searchPage.previousPage")}
              </button>
              <span className="text-sm text-ac-espresso">
                {t("searchPage.pageIndicator", { page: initialFilters.page, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={initialFilters.page >= totalPages}
                onClick={() => patchFilters({ page: Math.min(totalPages, initialFilters.page + 1) })}
                className={`min-h-11 rounded-full border border-ba-espresso/[0.12] px-4 py-2 text-sm text-ac-espresso transition-colors enabled:hover:border-ba-gold/30 enabled:hover:text-ba-espresso disabled:opacity-40 ${dsFocus.ring}`}
              >
                {t("searchPage.nextPage")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
