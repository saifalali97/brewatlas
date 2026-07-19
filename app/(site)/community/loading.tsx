import { CardGridSkeleton } from "@/app/components/ui/card-grid-skeleton";
import { SectionFrame } from "@/app/components/ui/section-frame";

export default function CommunityLoading() {
  return (
    <SectionFrame id="community-loading" ariaLabelledBy="community-loading-heading" padding="compact">
      
      <h1 id="community-loading-heading" className="sr-only">Loading</h1>
<div className="animate-pulse space-y-6">
        <div className="h-4 w-28 rounded bg-ba-espresso/08" />
        <div className="h-10 max-w-md rounded bg-ba-espresso/08" />
        <div className="h-5 max-w-2xl rounded bg-ba-espresso/06" />
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-[1.5rem] bg-ba-espresso/06" />
        <div className="h-64 rounded-[1.5rem] bg-ba-espresso/06" />
      </div>
      <div className="mt-12">
        <CardGridSkeleton count={3} />
      </div>
    </SectionFrame>
  );
}
