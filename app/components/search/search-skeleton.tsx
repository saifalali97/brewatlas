import { cards } from "@/lib/constants/styles";
import { Skeleton } from "@/app/components/ui/skeleton";

export function SearchSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading search results">
      <Skeleton className="h-12 max-w-xl rounded-full" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-11 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`h-80 overflow-hidden ${cards.premiumShell}`}>
            <Skeleton className="h-44 rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
