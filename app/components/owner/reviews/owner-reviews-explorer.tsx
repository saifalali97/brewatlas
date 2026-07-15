"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { OwnerReviewRowActions } from "@/app/components/owner/reviews/owner-review-row-actions";
import { OwnerReviewStatusBadge } from "@/app/components/owner/reviews/owner-review-status-badge";
import { buttons } from "@/lib/constants/styles";
import type { OwnerReviewsPageResult } from "@/lib/data/owner-reviews";
import { translate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import type { OwnerReviewStatusFilter } from "@/lib/data/owner-reviews";

const inputClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

type OwnerReviewsExplorerProps = {
  result: OwnerReviewsPageResult;
  labels: Dictionary["ownerReviewsPage"];
  dictionary: Dictionary;
  filters: {
    search: string;
    status: OwnerReviewStatusFilter;
  };
};

function buildQuery(pathname: string, filters: OwnerReviewsExplorerProps["filters"], page: number): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.status !== "all") params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

export function OwnerReviewsExplorer({ result, labels, dictionary, filters }: OwnerReviewsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  const applyFilters = useCallback(
    (next: Partial<OwnerReviewsExplorerProps["filters"]>) => {
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
        className="grid gap-4 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          applyFilters({
            search: String(formData.get("q") ?? ""),
            status: String(formData.get("status") ?? "all") as OwnerReviewStatusFilter,
          });
        }}
      >
        <div className="lg:col-span-2">
          <label htmlFor="owner-review-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <input
            id="owner-review-search"
            name="q"
            type="search"
            defaultValue={filters.search}
            placeholder={labels.searchPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="owner-review-status" className="sr-only">
            {labels.filterStatus}
          </label>
          <select id="owner-review-status" name="status" defaultValue={filters.status} className={selectClass}>
            <option value="all">{labels.filterAll}</option>
            <option value="visible">{labels.statusVisible}</option>
            <option value="hidden">{labels.statusHidden}</option>
            <option value="flagged">{labels.statusFlagged}</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" className={`${buttons.secondary} w-full sm:w-auto`} disabled={isPending}>
            {labels.applyFilters}
          </button>
        </div>
      </form>

      {isPending ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[1.25rem] bg-white/[0.04]" />
          ))}
        </div>
      ) : result.items.length === 0 ? (
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-12 text-center">
          <p className="text-sm font-medium text-stone-300">{labels.noReviewsTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{labels.noReviewsDescription}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.25rem] border border-white/[0.09] bg-white/[0.02]">
          <table className="min-w-full text-start text-sm">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">{labels.columnReviewer}</th>
                <th className="px-4 py-3 font-medium">{labels.columnRecipe}</th>
                <th className="px-4 py-3 font-medium">{labels.columnRating}</th>
                <th className="px-4 py-3 font-medium">{labels.columnReview}</th>
                <th className="px-4 py-3 font-medium">{labels.columnStatus}</th>
                <th className="px-4 py-3 font-medium">{labels.columnDate}</th>
                <th className="px-4 py-3 font-medium">{labels.columnActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {result.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-4">
                    <p className="font-medium text-stone-100">{item.reviewerName ?? labels.anonymousReviewer}</p>
                    {item.reviewerCountry && <p className="mt-0.5 text-xs text-stone-500">{item.reviewerCountry}</p>}
                  </td>
                  <td className="px-4 py-4">
                    {item.recipeSlug ? (
                      <Link
                        href={`/recipes/${item.recipeSlug}#reviews`}
                        className="font-medium text-amber-400/90 underline-offset-4 hover:underline"
                      >
                        {item.recipeTitle}
                      </Link>
                    ) : (
                      item.recipeTitle
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <StarRatingDisplay rating={item.rating} label={`${item.rating}/5`} size="sm" />
                  </td>
                  <td className="max-w-xs px-4 py-4">
                    <p className="line-clamp-3 text-stone-300">{item.reviewText ?? labels.ratingOnlyReview}</p>
                    {item.helpfulCount > 0 && (
                      <p className="mt-1 text-xs text-stone-500">
                        {translate(dictionary, "ownerReviewsPage.helpfulCountTemplate", { count: item.helpfulCount })}
                      </p>
                    )}
                    {item.flagReason && (
                      <p className="mt-2 text-xs text-amber-300/90">
                        {translate(dictionary, "ownerReviewsPage.flagReasonTemplate", { reason: item.flagReason })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <OwnerReviewStatusBadge status={item.moderationStatus} labels={labels} />
                  </td>
                  <td className="px-4 py-4 text-xs text-stone-500">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4">
                    <OwnerReviewRowActions reviewId={item.id} status={item.moderationStatus} labels={labels} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && !isPending && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={result.page <= 1}
            onClick={() => goToPage(result.page - 1)}
            className={`${buttons.secondary} disabled:opacity-40`}
          >
            {labels.previousPage}
          </button>
          <span className="text-sm text-stone-500">
            {translate(dictionary, "ownerReviewsPage.pageTemplate", { page: result.page, total: totalPages })}
          </span>
          <button
            type="button"
            disabled={result.page >= totalPages}
            onClick={() => goToPage(result.page + 1)}
            className={`${buttons.secondary} disabled:opacity-40`}
          >
            {labels.nextPage}
          </button>
        </div>
      )}
    </div>
  );
}
