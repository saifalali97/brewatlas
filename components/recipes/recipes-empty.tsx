import { SearchX } from "lucide-react";
import { layout } from "@/lib/constants/styles";

export function RecipesEmpty() {
  return (
    <div
      className={`${layout.container} flex flex-col items-center justify-center rounded-[1.5rem] border border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center`}
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
        <SearchX className="h-6 w-6 text-stone-500" aria-hidden />
      </div>
      <h2 className="text-xl font-medium text-stone-100">No recipes found</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        Try adjusting your search or filters. This empty state will appear when
        no recipes match your criteria.
      </p>
    </div>
  );
}
