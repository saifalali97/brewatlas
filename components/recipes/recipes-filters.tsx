import { Button } from "@/components/ui/button";
import { layout } from "@/lib/constants/styles";
import {
  recipeBrewingMethods,
  recipeDifficultyFilters,
  recipeRoastFilters,
} from "@/lib/recipes/constants";

type FilterGroupProps = {
  label: string;
  options: readonly string[];
  activeOption: string;
};

function FilterGroup({ label, options, activeOption }: FilterGroupProps) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-stone-500">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            variant={option === activeOption ? "active" : "default"}
            size="sm"
            aria-pressed={option === activeOption}
            aria-label={`Filter by ${option}`}
          >
            {option}
          </Button>
        ))}
      </div>
    </fieldset>
  );
}

export function RecipesFilters() {
  return (
    <section
      aria-label="Recipe filters"
      className={`${layout.container} mb-10 space-y-8 md:mb-12`}
    >
      <FilterGroup
        label="Brew Method"
        options={recipeBrewingMethods}
        activeOption="All"
      />
      <FilterGroup
        label="Difficulty"
        options={recipeDifficultyFilters}
        activeOption="All Levels"
      />
      <FilterGroup
        label="Roast Level"
        options={recipeRoastFilters}
        activeOption="All Roasts"
      />
      <p className="text-xs text-stone-500">
        Filters are placeholders for now. Interactive filtering arrives in Sprint 2.
      </p>
    </section>
  );
}
