import { acTypography } from "@/lib/design-system/atlas-canon";
import { Skeleton } from "@/app/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading search results">
      <Skeleton className="h-14 max-w-xl rounded-sm bg-ac-espresso/[0.06]" />
      <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-ac-espresso/[0.08] pb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-5 w-16 rounded-sm bg-ac-espresso/[0.06]" />
        ))}
      </div>
      <div className="space-y-0">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="ac-folio-divider flex items-center gap-8 py-8">
            <Skeleton className="h-5 w-8 rounded-sm bg-ac-espresso/[0.06]" />
            <Skeleton className="h-20 w-20 shrink-0 rounded-sm bg-ac-espresso/[0.06]" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-6 w-2/5 rounded-sm bg-ac-espresso/[0.06]" />
              <Skeleton className="h-4 w-3/5 rounded-sm bg-ac-espresso/[0.06]" />
            </div>
          </div>
        ))}
      </div>
      <p className={`${acTypography.caption} text-center`}>Searching the archive…</p>
    </div>
  );
}
