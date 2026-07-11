import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { layout } from "@/lib/constants/styles";

export function RecipesSearch() {
  return (
    <section
      aria-label="Search recipes"
      className={`${layout.container} mb-8 md:mb-10`}
    >
      <div className="relative max-w-xl">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
          aria-hidden
        />
        <Input
          type="search"
          name="recipe-search"
          placeholder="Search recipes by name, origin, or roaster…"
          aria-label="Search recipes"
          className="pl-11"
          readOnly
        />
        <p className="mt-2 text-xs text-stone-500">
          Search will be available in a future update.
        </p>
      </div>
    </section>
  );
}
