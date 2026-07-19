type SkeletonProps = {
  className?: string;
};

/** Shimmer placeholder for loading states — respects reduced motion via CSS. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-shimmer rounded-xl bg-ba-espresso/06 motion-reduce:animate-none motion-reduce:bg-ba-espresso/08 ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
