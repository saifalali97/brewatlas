import { CardGridSkeleton } from "@/app/components/ui/card-grid-skeleton";
import { SectionFrame } from "@/app/components/ui/section-frame";

export default function RecipesLoading() {
  return (
    <SectionFrame id="recipes-loading" ariaLabelledBy="recipes-loading-heading" padding="compact">
      
      <h1 id="recipes-loading-heading" className="sr-only">Loading</h1>
<div className="animate-pulse space-y-6">
        <div className="h-4 w-28 rounded bg-white/[0.06]" />
        <div className="h-10 max-w-lg rounded bg-white/[0.06]" />
        <div className="h-5 max-w-2xl rounded bg-white/[0.04]" />
      </div>
      <div className="mt-10">
        <CardGridSkeleton />
      </div>
    </SectionFrame>
  );
}
