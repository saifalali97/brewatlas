"use client";

import { deleteRecipeAction } from "@/lib/supabase/recipe-actions";

type DeleteRecipeButtonProps = {
  recipeId: string;
  recipeTitle: string;
};

export function DeleteRecipeButton({ recipeId, recipeTitle }: DeleteRecipeButtonProps) {
  return (
    <form
      action={deleteRecipeAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${recipeTitle}"? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="recipeId" value={recipeId} />
      <button
        type="submit"
        className="text-xs font-medium text-red-400/80 underline-offset-4 transition-colors hover:text-red-400 hover:underline"
      >
        Delete
      </button>
    </form>
  );
}
