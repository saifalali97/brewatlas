"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { AdminAuditPageResult } from "@/lib/data/admin-audit";
import { buttons } from "@/lib/constants/styles";
import type { Dictionary } from "@/lib/i18n/types";

type OwnerAuditLogPanelProps = {
  result: AdminAuditPageResult;
  labels: Dictionary["ownerAnalyticsPage"];
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(
    new Date(iso),
  );
}

function buildQuery(pathname: string, page: number): string {
  return page > 1 ? `${pathname}?auditPage=${page}` : pathname;
}

export function OwnerAuditLogPanel({ result, labels }: OwnerAuditLogPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  const goToPage = useCallback(
    (page: number) => {
      startTransition(() => {
        router.replace(buildQuery(pathname, page), { scroll: false });
      });
    },
    [pathname, router],
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-stone-100">{labels.auditLogTitle}</h3>
      <p className="mt-1 text-xs text-stone-500">{labels.auditLogDescription}</p>

      {result.items.length === 0 ? (
        <p className="mt-6 text-sm text-stone-500">{labels.auditLogEmpty}</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-xs uppercase tracking-[0.12em] text-stone-500">
                <th className="px-3 py-2">{labels.auditColumnWhen}</th>
                <th className="px-3 py-2">{labels.auditColumnActor}</th>
                <th className="px-3 py-2">{labels.auditColumnAction}</th>
                <th className="px-3 py-2">{labels.auditColumnTarget}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((entry) => (
                <tr key={entry.id} className="border-b border-white/[0.05] text-stone-300">
                  <td className="px-3 py-3 whitespace-nowrap">{formatDate(entry.createdAt)}</td>
                  <td className="px-3 py-3">{entry.actorName ?? labels.anonymousActor}</td>
                  <td className="px-3 py-3 font-medium text-stone-100">{entry.action}</td>
                  <td className="px-3 py-3">
                    <span className="text-stone-500">{entry.targetType}</span>
                    <span className="mx-1 text-stone-600">·</span>
                    <span className="font-mono text-xs">{entry.targetId.slice(0, 8)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            {labels.auditPageTemplate.replace("{page}", String(result.page)).replace("{total}", String(totalPages))}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={result.page <= 1 || isPending}
              onClick={() => goToPage(result.page - 1)}
              className={`${buttons.secondary} text-xs`}
            >
              {labels.previousPage}
            </button>
            <button
              type="button"
              disabled={result.page >= totalPages || isPending}
              onClick={() => goToPage(result.page + 1)}
              className={`${buttons.secondary} text-xs`}
            >
              {labels.nextPage}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
