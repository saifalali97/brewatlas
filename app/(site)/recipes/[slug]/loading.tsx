import { SectionFrame } from "@/app/components/ui/section-frame";

export default function RecipeDetailLoading() {
  return (
    <SectionFrame id="recipe-detail-loading" ariaLabelledBy="recipe-detail-loading-heading" padding="compact">
      
      <h1 id="recipe-detail-loading-heading" className="sr-only">Loading</h1>
<div className="animate-pulse space-y-8">
        <div className="h-4 w-32 rounded bg-white/[0.06]" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="aspect-[4/3] rounded-[1.5rem] bg-white/[0.04]" />
          <div className="space-y-4">
            <div className="h-10 rounded bg-white/[0.06]" />
            <div className="h-4 w-3/4 rounded bg-white/[0.04]" />
            <div className="h-4 w-2/3 rounded bg-white/[0.04]" />
            <div className="grid grid-cols-2 gap-3 pt-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 rounded-xl bg-white/[0.04]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}
