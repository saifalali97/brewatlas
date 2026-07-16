import { Chapter } from "@/app/components/atlas/chapter";
import { Skeleton } from "@/app/components/ui/skeleton";

function FolioRowSkeleton() {
  return (
    <div className="flex items-center gap-6 border-b border-ac-espresso/[0.08] py-7 sm:gap-8">
      <Skeleton className="h-4 w-8 shrink-0" />
      <Skeleton className="h-20 w-20 shrink-0 rounded-none" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-6 w-2/3 max-w-sm" />
        <Skeleton className="h-4 w-1/2 max-w-xs" />
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
      <div className="max-w-4xl space-y-6" aria-busy="true" aria-label="Loading recipes">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
        <Skeleton className="mt-6 h-10 w-full max-w-md" />
      </div>
      <div className="mt-14 flex gap-6 border-b border-ac-espresso/[0.08] pb-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-16" />
        ))}
      </div>
      <div className="mt-16 grid gap-8 lg:grid-cols-12">
        <Skeleton className="min-h-[20rem] lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <div className="mt-20">
        {Array.from({ length: 6 }).map((_, index) => (
          <FolioRowSkeleton key={index} />
        ))}
      </div>
    </Chapter>
  );
}
