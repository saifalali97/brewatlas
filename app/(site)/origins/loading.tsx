import { Chapter } from "@/app/components/atlas/chapter";
import { acGrid } from "@/lib/design-system/atlas-canon";

export default function OriginsLoading() {
  return (
    <Chapter id="origins-atlas-loading" rhythm="sand" padding="standard" wide>
      <div className="max-w-3xl animate-pulse">
        <div className="h-3 w-24 rounded bg-ac-espresso/10" />
        <div className="mt-6 h-12 w-2/3 rounded bg-ac-espresso/10" />
        <div className="mt-6 h-20 w-full rounded bg-ac-espresso/10" />
      </div>
      <div className={`${acGrid.rail} mt-16`}>
        <div className="hidden lg:col-span-3 lg:block">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-8 rounded bg-ac-espresso/10" />
            ))}
          </div>
        </div>
        <div className="space-y-8 lg:col-span-9">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[85svh] rounded bg-ac-espresso/10" />
          ))}
        </div>
      </div>
    </Chapter>
  );
}
