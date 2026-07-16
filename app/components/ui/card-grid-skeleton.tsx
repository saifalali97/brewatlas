import { cards } from "@/lib/constants/styles";
import { Skeleton } from "@/app/components/ui/skeleton";

type CardGridSkeletonProps = {
  count?: number;
  cardHeightClass?: string;
};

/** Shimmer skeleton for recipe/card grid layouts. */
export function CardGridSkeleton({ count = 6, cardHeightClass = "h-80" }: CardGridSkeletonProps) {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${cardHeightClass} overflow-hidden ${cards.premiumShell}`}>
          <Skeleton className="h-44 rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
