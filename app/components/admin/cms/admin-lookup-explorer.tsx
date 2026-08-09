"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition, type ReactNode } from "react";
import { ConfirmDestructiveModal } from "@/app/components/admin/cms/confirm-destructive-modal";
import { buttons } from "@/lib/constants/styles";
import type { AdminLookupStatusFilter } from "@/lib/data/admin-lookups";

type PageResult<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const inputClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none transition-colors placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

/** Serializable column config — must not include functions (RSC → client boundary). */
export type AdminLookupColumn = {
  key: string;
  header: string;
  /** Property key on each row item. */
  accessor: string;
  format?: "text" | "emphasis" | "mono" | "flag" | "yesNo" | "number";
  empty?: string;
};

function readAccessor(item: Record<string, unknown>, accessor: string): unknown {
  return item[accessor];
}

function renderColumnCell(item: Record<string, unknown>, column: AdminLookupColumn): ReactNode {
  const raw = readAccessor(item, column.accessor);
  const empty = column.empty ?? "—";
  const format = column.format ?? "text";

  if (format === "yesNo") {
    return raw ? "Yes" : empty;
  }

  if (raw == null || raw === "") {
    return empty;
  }

  if (format === "emphasis") {
    return <span className="font-medium text-stone-100">{String(raw)}</span>;
  }
  if (format === "mono") {
    return <span className="font-mono text-xs">{String(raw)}</span>;
  }
  if (format === "flag") {
    return <span className="text-lg">{String(raw)}</span>;
  }
  if (format === "number") {
    return typeof raw === "number" ? raw : String(raw);
  }

  return String(raw);
}

type BulkLabels = {
  bulkSelectedTemplate?: string;
  bulkPublish?: string;
  bulkUnpublish?: string;
  bulkFeature?: string;
  bulkUnfeature?: string;
  bulkVerify?: string;
  bulkUnverify?: string;
  bulkDelete?: string;
  bulkDeleteConfirm?: string;
  cancel?: string;
  confirm?: string;
};

type BulkActionKey = "publish" | "unpublish" | "feature" | "unfeature" | "verify" | "unverify" | "delete";

type AdminLookupExplorerProps<T extends { id: string; published: boolean }> = {
  result: PageResult<T>;
  basePath: string;
  newPath: string;
  columns: AdminLookupColumn[];
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
  } & BulkLabels;
  filters: { search: string; status: AdminLookupStatusFilter };
  onTogglePublish: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onBulkAction?: (formData: FormData) => Promise<void>;
  enableBulk?: boolean;
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
  onBulkAction,
  enableBulk = false,
}: AdminLookupExplorerProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingBulk, setPendingBulk] = useState<"delete" | null>(null);
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
  const allIds = useMemo(() => result.items.map((item) => item.id), [result.items]);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.includes(id));

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

  const toggleOne = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleAll = () => {
    setSelected((current) => (allSelected ? current.filter((id) => !allIds.includes(id)) : Array.from(new Set([...current, ...allIds]))));
  };

  const runBulk = (action: BulkActionKey) => {
    if (!onBulkAction || selected.length === 0) return;
    if (action === "delete") {
      setPendingBulk("delete");
      return;
    }
    const formData = new FormData();
    for (const id of selected) formData.append("ids", id);
    formData.set("bulkAction", action);
    startTransition(async () => {
      await onBulkAction(formData);
      setSelected([]);
    });
  };

  const confirmBulkDelete = () => {
    if (!onBulkAction || selected.length === 0) return;
    const formData = new FormData();
    for (const id of selected) formData.append("ids", id);
    formData.set("bulkAction", "delete");
    startTransition(async () => {
      await onBulkAction(formData);
      setSelected([]);
      setPendingBulk(null);
    });
  };

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

      {enableBulk && selected.length > 0 && onBulkAction ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
          <span>
            {(labels.bulkSelectedTemplate ?? "{count} selected").replace("{count}", String(selected.length))}
          </span>
          <button type="button" className={`${buttons.secondary} text-xs`} onClick={() => runBulk("publish")}>
            {labels.bulkPublish ?? labels.publish}
          </button>
          <button type="button" className={`${buttons.secondary} text-xs`} onClick={() => runBulk("unpublish")}>
            {labels.bulkUnpublish ?? labels.unpublish}
          </button>
          {labels.bulkFeature ? (
            <button type="button" className={`${buttons.secondary} text-xs`} onClick={() => runBulk("feature")}>
              {labels.bulkFeature}
            </button>
          ) : null}
          {labels.bulkUnfeature ? (
            <button type="button" className={`${buttons.secondary} text-xs`} onClick={() => runBulk("unfeature")}>
              {labels.bulkUnfeature}
            </button>
          ) : null}
          {labels.bulkVerify ? (
            <button type="button" className={`${buttons.secondary} text-xs`} onClick={() => runBulk("verify")}>
              {labels.bulkVerify}
            </button>
          ) : null}
          {labels.bulkUnverify ? (
            <button type="button" className={`${buttons.secondary} text-xs`} onClick={() => runBulk("unverify")}>
              {labels.bulkUnverify}
            </button>
          ) : null}
          <button type="button" className={`${buttons.secondary} text-xs text-rose-300/90`} onClick={() => runBulk("delete")}>
            {labels.bulkDelete ?? labels.delete}
          </button>
        </div>
      ) : null}

      {result.items.length === 0 ? (
        <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center text-sm text-stone-500">
          {labels.noResults}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
                {enableBulk ? (
                  <th className="px-4 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
                  </th>
                ) : null}
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
                  {enableBulk ? (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggleOne(item.id)}
                        aria-label={`Select ${item.id}`}
                      />
                    </td>
                  ) : null}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      {renderColumnCell(item as Record<string, unknown>, col)}
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

      <ConfirmDestructiveModal
        open={pendingBulk === "delete"}
        title={labels.bulkDeleteConfirm ?? labels.deleteConfirm}
        description={(labels.bulkSelectedTemplate ?? "{count} selected").replace("{count}", String(selected.length))}
        confirmLabel={labels.confirm ?? labels.delete}
        cancelLabel={labels.cancel ?? "Cancel"}
        busy={isPending}
        onConfirm={confirmBulkDelete}
        onCancel={() => setPendingBulk(null)}
      />
    </div>
  );
}
