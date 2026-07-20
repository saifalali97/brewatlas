import { Chapter } from "@/app/components/atlas/chapter";
import { Skeleton } from "@/app/components/ui/skeleton";

function FolioRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-ac-espresso/[0.08] py-5 sm:gap-6 sm:py-7">
      <Skeleton className="h-16 w-16 shrink-0 rounded-none sm:h-20 sm:w-20" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-2/3 max-w-sm sm:h-6" />
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
      <div className="mt-10 hidden gap-8 lg:grid lg:grid-cols-12">
        <Skeleton className="min-h-[20rem] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
      </div>
      <div className="mt-10 sm:mt-14">
        {Array.from({ length: 3 }).map((_, index) => (
          <FolioRowSkeleton key={index} />
        ))}
      </div>
    </Chapter>
  );
}
