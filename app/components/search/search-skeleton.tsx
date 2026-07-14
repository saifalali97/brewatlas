import { cards } from "@/lib/constants/styles";

export function SearchSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      <div className="h-12 max-w-xl rounded-full bg-white/[0.06]" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-9 w-24 rounded-full bg-white/[0.05]" />
        ))}
      </div>
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`h-80 ${cards.premiumShell}`}>
            <div className="h-44 bg-white/[0.04]" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-2/3 rounded bg-white/[0.06]" />
              <div className="h-4 w-full rounded bg-white/[0.04]" />
              <div className="h-4 w-4/5 rounded bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
