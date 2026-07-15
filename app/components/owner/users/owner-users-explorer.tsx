"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { OwnerUserRowActions } from "@/app/components/owner/users/owner-user-row-actions";
import { buttons } from "@/lib/constants/styles";
import type { OwnerUsersPageResult, OwnerUserStatusFilter } from "@/lib/data/owner-users";
import type { Dictionary } from "@/lib/i18n/types";

const inputClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

type OwnerUsersExplorerProps = {
  result: OwnerUsersPageResult;
  labels: Dictionary["ownerUsersPage"];
  filters: {
    search: string;
    status: OwnerUserStatusFilter;
  };
};

function buildQuery(pathname: string, filters: OwnerUsersExplorerProps["filters"], page: number): string {
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

export function OwnerUsersExplorer({ result, labels, filters }: OwnerUsersExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  const applyFilters = useCallback(
    (next: Partial<OwnerUsersExplorerProps["filters"]>) => {
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
            status: String(formData.get("status") ?? "all") as OwnerUserStatusFilter,
          });
        }}
      >
        <div className="lg:col-span-2">
          <label htmlFor="owner-user-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <input
            id="owner-user-search"
            name="q"
            type="search"
            defaultValue={filters.search}
            placeholder={labels.searchPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="owner-user-status" className="sr-only">
            {labels.filterStatus}
          </label>
          <select id="owner-user-status" name="status" defaultValue={filters.status} className={selectClass}>
            <option value="all">{labels.filterAll}</option>
            <option value="active">{labels.filterActive}</option>
            <option value="suspended">{labels.filterSuspended}</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <button type="submit" disabled={isPending} className={`${buttons.secondary} text-sm`}>
            {labels.applyFilters}
          </button>
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
          <p className="font-medium text-stone-200">{labels.noUsersTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{labels.noUsersDescription}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
                <th className="px-4 py-3">{labels.columnUser}</th>
                <th className="px-4 py-3">{labels.columnRole}</th>
                <th className="px-4 py-3">{labels.columnPlan}</th>
                <th className="px-4 py-3">{labels.columnActivity}</th>
                <th className="px-4 py-3">{labels.columnStatus}</th>
                <th className="px-4 py-3">{labels.columnJoined}</th>
                <th className="px-4 py-3">{labels.columnActions}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((user) => (
                <tr key={user.id} className="border-b border-white/[0.05] text-stone-300">
                  <td className="px-4 py-4">
                    <div className="font-medium text-stone-100">{user.displayName ?? labels.anonymousUser}</div>
                    <div className="mt-0.5 text-xs text-stone-500">{user.country ?? labels.noCountry}</div>
                  </td>
                  <td className="px-4 py-4 capitalize">{user.role}</td>
                  <td className="px-4 py-4 capitalize">
                    {user.plan}
                    {user.subscriptionStatus ? (
                      <span className="mt-1 block text-xs text-stone-500">{user.subscriptionStatus}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <div>{labels.recipesCountTemplate.replace("{count}", String(user.recipesCreated))}</div>
                    <div>{labels.reviewsCountTemplate.replace("{count}", String(user.reviewsWritten))}</div>
                  </td>
                  <td className="px-4 py-4">
                    {user.suspendedAt ? (
                      <span className="rounded-full border border-rose-600/35 bg-rose-950/35 px-2.5 py-1 text-xs font-medium text-rose-200/90">
                        {labels.statusSuspended}
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-600/30 bg-emerald-950/30 px-2.5 py-1 text-xs font-medium text-emerald-200/90">
                        {labels.statusActive}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/users/${user.id}`} className={`${buttons.secondary} text-xs`}>
                        {labels.viewProfile}
                      </Link>
                      <OwnerUserRowActions user={user} labels={labels} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            {labels.pageTemplate.replace("{page}", String(result.page)).replace("{total}", String(totalPages))}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={result.page <= 1 || isPending} onClick={() => goToPage(result.page - 1)} className={`${buttons.secondary} text-xs`}>
              {labels.previousPage}
            </button>
            <button type="button" disabled={result.page >= totalPages || isPending} onClick={() => goToPage(result.page + 1)} className={`${buttons.secondary} text-xs`}>
              {labels.nextPage}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
