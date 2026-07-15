"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { buttons } from "@/lib/constants/styles";
import type {
  OwnerSubscriptionPlanFilter,
  OwnerSubscriptionsPageResult,
  OwnerSubscriptionStatusFilter,
} from "@/lib/data/owner-subscriptions";
import type { Dictionary } from "@/lib/i18n/types";

const inputClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

type OwnerSubscriptionsExplorerProps = {
  result: OwnerSubscriptionsPageResult;
  labels: Dictionary["ownerSubscriptionsPage"];
  filters: {
    search: string;
    plan: OwnerSubscriptionPlanFilter;
    status: OwnerSubscriptionStatusFilter;
  };
};

function buildQuery(pathname: string, filters: OwnerSubscriptionsExplorerProps["filters"], page: number): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.plan !== "all") params.set("plan", filters.plan);
  if (filters.status !== "all") params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

export function OwnerSubscriptionsExplorer({ result, labels, filters }: OwnerSubscriptionsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  const applyFilters = useCallback(
    (next: Partial<OwnerSubscriptionsExplorerProps["filters"]>) => {
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
        className="grid gap-4 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          applyFilters({
            search: String(formData.get("q") ?? ""),
            plan: String(formData.get("plan") ?? "all") as OwnerSubscriptionPlanFilter,
            status: String(formData.get("status") ?? "all") as OwnerSubscriptionStatusFilter,
          });
        }}
      >
        <div className="lg:col-span-2">
          <label htmlFor="owner-subscription-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <input
            id="owner-subscription-search"
            name="q"
            type="search"
            defaultValue={filters.search}
            placeholder={labels.searchPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="owner-subscription-plan" className="sr-only">
            {labels.filterPlan}
          </label>
          <select id="owner-subscription-plan" name="plan" defaultValue={filters.plan} className={selectClass}>
            <option value="all">{labels.filterAll}</option>
            <option value="free">{labels.planFree}</option>
            <option value="premium">{labels.planPremium}</option>
            <option value="enterprise">{labels.planEnterprise}</option>
          </select>
        </div>
        <div>
          <label htmlFor="owner-subscription-status" className="sr-only">
            {labels.filterStatus}
          </label>
          <select id="owner-subscription-status" name="status" defaultValue={filters.status} className={selectClass}>
            <option value="all">{labels.filterAll}</option>
            <option value="active">{labels.statusActive}</option>
            <option value="trialing">{labels.statusTrialing}</option>
            <option value="past_due">{labels.statusPastDue}</option>
            <option value="canceled">{labels.statusCanceled}</option>
            <option value="expired">{labels.statusExpired}</option>
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" disabled={isPending} className={`${buttons.secondary} text-sm`}>
            {labels.applyFilters}
          </button>
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
          <p className="font-medium text-stone-200">{labels.noSubscriptionsTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{labels.noSubscriptionsDescription}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
                <th className="px-4 py-3">{labels.columnMember}</th>
                <th className="px-4 py-3">{labels.columnPlan}</th>
                <th className="px-4 py-3">{labels.columnStatus}</th>
                <th className="px-4 py-3">{labels.columnBilling}</th>
                <th className="px-4 py-3">{labels.columnRenews}</th>
                <th className="px-4 py-3">{labels.columnActions}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.05] text-stone-300">
                  <td className="px-4 py-4">
                    <div className="font-medium text-stone-100">{item.displayName ?? labels.anonymousMember}</div>
                    <div className="mt-0.5 text-xs text-stone-500">{item.country ?? labels.noCountry}</div>
                  </td>
                  <td className="px-4 py-4 capitalize">{item.plan}</td>
                  <td className="px-4 py-4">
                    <span className="capitalize">{item.status}</span>
                    {item.cancelAtPeriodEnd ? (
                      <span className="mt-1 block text-xs text-amber-300/90">{labels.cancelScheduled}</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-xs">
                    <div className="capitalize">{item.billingProvider}</div>
                    {item.billingInterval ? <div>{item.billingInterval}</div> : null}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {item.status === "trialing" ? formatDate(item.trialEndsAt) : formatDate(item.currentPeriodEnd)}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/users/${item.userId}`} className={`${buttons.secondary} text-xs`}>
                      {labels.viewMember}
                    </Link>
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
