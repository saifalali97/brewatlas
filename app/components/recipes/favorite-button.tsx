"use client";

import { Heart } from "lucide-react";
import { addFavoriteAction, removeFavoriteAction } from "@/lib/supabase/favorite-actions";
import { useTranslations } from "@/lib/i18n/translation-context";

type FavoriteButtonProps = {
  recipeId: string;
  isFavorited: boolean;
  currentPath: string;
  size?: "sm" | "lg";
  className?: string;
};

/**
 * Renders as a sibling overlay next to a `RecipeCard`, never nested inside
 * its `<Link>`, so the heart button remains an independently clickable
 * control instead of triggering card navigation.
 */
export function FavoriteButton({
  recipeId,
  isFavorited,
  currentPath,
  size = "sm",
  className = "",
}: FavoriteButtonProps) {
  const { t } = useTranslations();
  const action = isFavorited ? removeFavoriteAction : addFavoriteAction;
  const dimension = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const iconSize = size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4";

  return (
    <form action={action} className={className}>
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="currentPath" value={currentPath} />
      <button
        type="submit"
        aria-label={isFavorited ? t("recipes.removeFromFavoritesAria") : t("recipes.addToFavoritesAria")}
        aria-pressed={isFavorited}
        className={`flex ${dimension} items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
          isFavorited
            ? "border-amber-500/50 bg-amber-950/70 text-amber-400"
            : "border-white/[0.14] bg-[#0a0705]/55 text-stone-200 hover:border-amber-500/40 hover:text-amber-100"
        }`}
      >
        <Heart className={iconSize} fill={isFavorited ? "currentColor" : "none"} aria-hidden />
      </button>
    </form>
  );
}
