"use client";

import { followUserAction, unfollowUserAction } from "@/lib/supabase/follow-actions";
import { useTranslations } from "@/lib/i18n/translation-context";

type FollowButtonProps = {
  userId: string;
  isFollowing: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  currentPath: string;
};

export function FollowButton({
  userId,
  isFollowing,
  isAuthenticated,
  isOwner,
  currentPath,
}: FollowButtonProps) {
  const { t } = useTranslations();

  if (isOwner || !isAuthenticated) {
    return null;
  }

  const action = isFollowing ? unfollowUserAction : followUserAction;

  return (
    <form action={action}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="currentPath" value={currentPath} />
      <button
        type="submit"
        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          isFollowing
            ? "border-white/[0.14] bg-white/[0.04] text-stone-300 hover:border-red-500/30 hover:text-red-300"
            : "border-amber-600/40 bg-amber-950/40 text-amber-100 hover:border-amber-500/55"
        }`}
      >
        {isFollowing ? t("community.unfollow") : t("community.follow")}
      </button>
    </form>
  );
}
