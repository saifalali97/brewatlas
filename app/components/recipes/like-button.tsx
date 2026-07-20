"use client";

import { Heart } from "lucide-react";
import { likeRecipeAction, unlikeRecipeAction } from "@/lib/supabase/recipe-engagement-actions";
import { useTranslations } from "@/lib/i18n/translation-context";

type LikeButtonProps = {
  recipeId: string;
  isLiked: boolean;
  likeCount: number;
  currentPath: string;
  size?: "sm" | "lg";
  className?: string;
};

export function LikeButton({
  recipeId,
  isLiked,
  likeCount,
  currentPath,
  size = "sm",
  className = "",
}: LikeButtonProps) {
  const { t } = useTranslations();
  const action = isLiked ? unlikeRecipeAction : likeRecipeAction;
  const dimension = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const iconSize = size === "lg" ? "h-[18px] w-[18px]" : "h-4 w-4";

  return (
    <form action={action} className={`inline-flex items-center gap-2 ${className}`}>
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="currentPath" value={currentPath} />
      <button
        type="submit"
        aria-label={isLiked ? t("communityPlatformPage.unlikeAria") : t("communityPlatformPage.likeAria")}
        aria-pressed={isLiked}
        className={`flex ${dimension} items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
          isLiked
            ? "border-rose-500/50 bg-rose-950/70 text-rose-300"
            : "border-white/[0.14] bg-[#0a0705]/55 text-stone-200 hover:border-rose-500/40 hover:text-rose-100"
        }`}
      >
        <Heart className={iconSize} fill={isLiked ? "currentColor" : "none"} aria-hidden />
      </button>
      <span className="text-sm font-medium text-ac-espresso tabular-nums">{likeCount}</span>
    </form>
  );
}
