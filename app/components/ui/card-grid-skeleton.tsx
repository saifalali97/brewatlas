import { cards } from "@/lib/constants/styles";

type CardGridSkeletonProps = {
  count?: number;
  cardHeightClass?: string;
};

/** Pulse skeleton for recipe/card grid layouts. */
export function CardGridSkeleton({ count = 6, cardHeightClass = "h-80" }: CardGridSkeletonProps) {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${cardHeightClass} animate-pulse ${cards.premiumShell}`}>
          <div className="h-44 bg-white/[0.04]" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-2/3 rounded bg-white/[0.06]" />
            <div className="h-4 w-full rounded bg-white/[0.04]" />
            <div className="h-4 w-4/5 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}
