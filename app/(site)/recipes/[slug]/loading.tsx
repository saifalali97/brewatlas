import { SectionFrame } from "@/app/components/ui/section-frame";
import { Skeleton } from "@/app/components/ui/skeleton";

export default function RecipeDetailLoading() {
  return (
    <SectionFrame id="recipe-detail-loading" ariaLabelledBy="recipe-detail-loading-heading" padding="compact">
      <h1 id="recipe-detail-loading-heading" className="sr-only">
        Loading
      </h1>
      <div className="space-y-8" aria-busy="true" aria-label="Loading recipe">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Skeleton className="aspect-[4/3] rounded-[1.5rem]" />
          <div className="space-y-4">
            <Skeleton className="h-10" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 gap-3 pt-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
