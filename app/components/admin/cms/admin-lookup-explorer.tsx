"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { buttons } from "@/lib/constants/styles";
import type { AdminLookupPageResult, AdminLookupStatusFilter } from "@/lib/data/admin-lookups";

const inputClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

export type AdminLookupColumn<T> = {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
};

type AdminLookupExplorerProps<T extends { id: string; published: boolean }> = {
  result: AdminLookupPageResult<T>;
  basePath: string;
  newPath: string;
  columns: AdminLookupColumn<T>[];
  labels: {
    searchPlaceholder: string;
    filterAll: string;
    filterPublished: string;
    filterDraft: string;
    applyFilters: string;
    create: string;
    edit: string;
    delete: string;
    publish: string;
    unpublish: string;
    noResults: string;
    previousPage: string;
    nextPage: string;
    pageTemplate: string;
    deleteConfirm: string;
    statusPublished: string;
    statusDraft: string;
  };
  filters: { search: string; status: AdminLookupStatusFilter };
  onTogglePublish: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
};

function buildQuery(basePath: string, filters: { search: string; status: AdminLookupStatusFilter }, page: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.status !== "all") params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function AdminLookupExplorer<T extends { id: string; published: boolean }>({
  result,
  basePath,
  newPath,
  columns,
  labels,
  filters,
  onTogglePublish,
  onDelete,
}: AdminLookupExplorerProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  const applyFilters = useCallback(
    (next: Partial<typeof filters>) => {
      const merged = { ...filters, ...next };
      startTransition(() => router.replace(buildQuery(pathname, merged, 1), { scroll: false }));
    },
    [filters, pathname, router],
  );

  const goToPage = useCallback(
    (page: number) => {
      startTransition(() => router.replace(buildQuery(pathname, filters, page), { scroll: false }));
    },
    [filters, pathname, router],
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form
          className="grid flex-1 gap-4 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            applyFilters({
              search: String(formData.get("q") ?? ""),
              status: String(formData.get("status") ?? "all") as AdminLookupStatusFilter,
            });
          }}
        >
          <div className="lg:col-span-2">
            <input name="q" type="search" defaultValue={filters.search} placeholder={labels.searchPlaceholder} className={inputClass} />
          </div>
          <select name="status" defaultValue={filters.status} className={selectClass}>
            <option value="all">{labels.filterAll}</option>
            <option value="published">{labels.filterPublished}</option>
            <option value="draft">{labels.filterDraft}</option>
          </select>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" disabled={isPending} className={`${buttons.secondary} text-sm`}>
              {labels.applyFilters}
            </button>
          </div>
        </form>
        <Link href={newPath} className={`${buttons.primary} shrink-0 text-sm`}>
          {labels.create}
        </Link>
      </div>

      {result.items.length === 0 ? (
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center text-sm text-stone-500">
          {labels.noResults}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3">
                    {col.header}
                  </th>
                ))}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id} className="border-b border-white/[0.05] text-stone-300">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      {col.render(item)}
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        item.published
                          ? "border-emerald-600/30 bg-emerald-950/30 text-emerald-200/90"
                          : "border-stone-600/30 bg-stone-950/30 text-stone-400"
                      }`}
                    >
                      {item.published ? labels.statusPublished : labels.statusDraft}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`${basePath}/${item.id}/edit`} className={`${buttons.secondary} text-xs`}>
                        {labels.edit}
                      </Link>
                      <form action={onTogglePublish}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="published" value={item.published ? "false" : "true"} />
                        <button type="submit" className={`${buttons.secondary} text-xs`}>
                          {item.published ? labels.unpublish : labels.publish}
                        </button>
                      </form>
                      <form
                        action={onDelete}
                        onSubmit={(event) => {
                          if (!window.confirm(labels.deleteConfirm)) event.preventDefault();
                        }}
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className={`${buttons.secondary} text-xs text-rose-300/90`}>
                          {labels.delete}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
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
      ) : null}
    </div>
  );
}
