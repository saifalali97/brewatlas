import type { Recipe } from "@/types/recipe";
import { layout } from "@/lib/constants/styles";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipesEmpty } from "@/components/recipes/recipes-empty";

type RecipesGridProps = {
  recipes: Recipe[];
};

export function RecipesGrid({ recipes }: RecipesGridProps) {
  if (recipes.length === 0) {
    return <RecipesEmpty />;
  }

  return (
    <section
      aria-label="Recipe results"
      className={`${layout.container} pb-24 md:pb-32`}
    >
      <p className="mb-8 text-sm text-stone-500">
        Showing <span className="font-medium text-stone-300">{recipes.length}</span>{" "}
        recipes
      </p>
      <ul className="grid list-none gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="min-w-0">
            <RecipeCard recipe={recipe} />
          </li>
        ))}
      </ul>
    </section>
  );
}
