import { CardGridSkeleton } from "@/app/components/ui/card-grid-skeleton";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function RecipesLoading() {
  return (
    <SectionFrame id="recipes-loading" ariaLabelledBy="recipes-loading-heading" padding="compact">
      <h1 id="recipes-loading-heading" className="sr-only">
        Loading
      </h1>
      <div className="space-y-6" aria-busy="true" aria-label="Loading recipes">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 max-w-lg" />
        <Skeleton className="h-5 max-w-2xl" />
      </div>
      <div className="mt-10">
        <CardGridSkeleton />
      </div>
    </SectionFrame>
  );
}
