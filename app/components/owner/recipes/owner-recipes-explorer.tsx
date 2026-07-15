"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { OwnerRecipeRowActions } from "@/app/components/owner/recipes/owner-recipe-row-actions";
import { OwnerRecipeStatusBadge } from "@/app/components/owner/recipes/owner-recipe-status-badge";
import { buttons } from "@/lib/constants/styles";
import { translate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import type { OwnerRecipeFilterOptions, OwnerRecipesPageResult } from "@/lib/data/owner-recipes";
const inputClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

type OwnerRecipesExplorerProps = {
  result: OwnerRecipesPageResult;
  filterOptions: OwnerRecipeFilterOptions;
  labels: Dictionary["ownerRecipesPage"];
  dictionary: Dictionary;
  filters: {
    search: string;
    brewingMethodId: string;
    deviceId: string;
    originId: string;
    published: string;
  };
};

function buildQuery(
  pathname: string,
  filters: OwnerRecipesExplorerProps["filters"],
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.brewingMethodId) params.set("brew", filters.brewingMethodId);
  if (filters.deviceId) params.set("device", filters.deviceId);
  if (filters.originId) params.set("origin", filters.originId);
  if (filters.published) params.set("status", filters.published);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function OwnerRecipesExplorer({
  result,
  filterOptions,
  labels,
  dictionary,
  filters,
}: OwnerRecipesExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  const applyFilters = useCallback(
    (next: Partial<OwnerRecipesExplorerProps["filters"]>) => {
      const merged = { ...filters, ...next };
      startTransition(() => {
        router.replace(buildQuery(pathname, merged, 1), { scroll: false });
      });
    },
    [filters, pathname, router],
  );

  const goToPage = useCallback(
    (page: number) => {
      startTransition(() => {
        router.replace(buildQuery(pathname, filters, page), { scroll: false });
      });
    },
    [filters, pathname, router],
  );

  return (
    <div className="mt-8 space-y-6">
      <form
        className="grid gap-4 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          applyFilters({
            search: String(formData.get("q") ?? ""),
            brewingMethodId: String(formData.get("brew") ?? ""),
            deviceId: String(formData.get("device") ?? ""),
            originId: String(formData.get("origin") ?? ""),
            published: String(formData.get("status") ?? ""),
          });
        }}
      >
        <div className="lg:col-span-2">
          <label htmlFor="owner-recipe-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <input
            id="owner-recipe-search"
            name="q"
            type="search"
            defaultValue={filters.search}
            placeholder={labels.searchPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="owner-recipe-brew" className="sr-only">
            {labels.filterBrewMethod}
          </label>
          <select id="owner-recipe-brew" name="brew" defaultValue={filters.brewingMethodId} className={selectClass}>
            <option value="">{labels.filterBrewMethod}</option>
            {filterOptions.brewingMethods.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="owner-recipe-device" className="sr-only">
            {labels.filterDevice}
          </label>
          <select id="owner-recipe-device" name="device" defaultValue={filters.deviceId} className={selectClass}>
            <option value="">{labels.filterDevice}</option>
            {filterOptions.devices.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="owner-recipe-origin" className="sr-only">
            {labels.filterOrigin}
          </label>
          <select id="owner-recipe-origin" name="origin" defaultValue={filters.originId} className={selectClass}>
            <option value="">{labels.filterOrigin}</option>
            {filterOptions.origins.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-5">
          <label htmlFor="owner-recipe-status" className="text-sm text-stone-400">
            {labels.filterStatus}
          </label>
          <select id="owner-recipe-status" name="status" defaultValue={filters.published} className={`${selectClass} max-w-xs`}>
            <option value="">{labels.filterAll}</option>
            <option value="draft">{labels.filterDraft}</option>
            <option value="published">{labels.filterPublished}</option>
            <option value="scheduled">{labels.filterScheduled}</option>
            <option value="archived">{labels.filterArchived}</option>
          </select>
          <button type="submit" className={`${buttons.secondary} h-10 px-4 text-xs`} disabled={isPending}>
            {labels.searchLabel}
          </button>
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{labels.noRecipesTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{labels.noRecipesDescription}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
          <ul className="divide-y divide-white/[0.07]">
            {result.items.map((recipe) => (
              <li key={recipe.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-medium text-stone-100">{recipe.title}</p>
                    <OwnerRecipeStatusBadge status={recipe.status} scheduledPublishAt={recipe.scheduledPublishAt} />
                    {recipe.featured ? (
                      <span className="rounded-full border border-amber-600/35 bg-amber-950/40 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300/90">
                        {labels.featuredBadge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {[recipe.brewingMethodName, recipe.deviceName, recipe.originLabel].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-1 text-xs text-stone-600">
                    {labels.authorLabel}: {recipe.authorName ?? "—"} · {labels.updatedLabel}:{" "}
                    {new Date(recipe.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  {recipe.status === "published" ? (
                    <Link
                      href={`/recipes/${recipe.slug}`}
                      className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
                    >
                      {labels.viewLink}
                    </Link>
                  ) : null}
                  <Link
                    href={`/dashboard/recipes/${recipe.id}/versions`}
                    className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
                  >
                    {labels.versionHistoryLink}
                  </Link>
                  <Link
                    href={`/dashboard/recipes/${recipe.id}/edit`}
                    className="text-xs font-medium text-amber-400/90 underline-offset-4 hover:underline"
                  >
                    {labels.editLink}
                  </Link>
                  <OwnerRecipeRowActions recipeId={recipe.id} title={recipe.title} status={recipe.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label={labels.paginationAria} className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, result.page - 1))}
            disabled={result.page <= 1 || isPending}
            className={`${buttons.secondary} h-9 px-4 text-xs disabled:opacity-50`}
          >
            {labels.previousPage}
          </button>
          <p className="text-sm text-stone-500">
            {translate(dictionary, "ownerRecipesPage.pageTemplate", {
              page: String(result.page),
              total: String(totalPages),
            })}
          </p>
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, result.page + 1))}
            disabled={result.page >= totalPages || isPending}
            className={`${buttons.secondary} h-9 px-4 text-xs disabled:opacity-50`}
          >
            {labels.nextPage}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
