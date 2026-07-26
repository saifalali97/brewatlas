import { Chapter } from "@/app/components/atlas/chapter";
import { Skeleton } from "@/app/components/ui/skeleton";

function FolioRowSkeleton() {
  return (
    <div className="flex items-start gap-5 border-b border-ac-espresso/[0.08] py-7 sm:gap-8 sm:py-9 md:py-10">
      <Skeleton className="h-6 w-10 shrink-0 rounded-none sm:h-7 sm:w-11" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-6 w-2/3 max-w-md sm:h-7" />
        <Skeleton className="h-3.5 w-full max-w-lg" />
        <Skeleton className="h-3.5 w-1/2 max-w-xs" />
      </div>
    </div>
  );
}

export default function RecipesLoading() {
  return (
    <Chapter id="recipes-loading" rhythm="dawn" padding="compact" wide ariaLabelledBy="recipes-loading-heading">
      <h1 id="recipes-loading-heading" className="sr-only">
        Loading
      </h1>
      <div className="max-w-4xl space-y-4 animate-content-fade-in sm:space-y-6" aria-busy="true" aria-label="Loading recipes">
        <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-10 w-full max-w-sm" />
      </div>
      <div className="mt-8 flex gap-4 border-b border-ac-espresso/[0.08] pb-4 sm:mt-10 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-14" />
        ))}
      </div>
      <div className="mt-10 space-y-4 border-b border-ac-espresso/[0.08] pb-12 sm:mt-14 sm:pb-16">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full max-w-xl sm:h-12" />
        <Skeleton className="h-4 w-2/5 max-w-xs" />
        <Skeleton className="h-16 w-full max-w-2xl" />
      </div>
      <div className="mt-10 sm:mt-14">
        {Array.from({ length: 3 }).map((_, index) => (
          <FolioRowSkeleton key={index} />
        ))}
      </div>
    </Chapter>
  );
}
