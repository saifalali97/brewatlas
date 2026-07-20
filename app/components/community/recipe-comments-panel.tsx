"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  createRecipeCommentAction,
  deleteRecipeCommentAction,
  likeRecipeCommentAction,
  unlikeRecipeCommentAction,
  type CommentActionState,
} from "@/lib/supabase/community-platform-actions";
import type { RecipeComment } from "@/types/community-platform";

type RecipeCommentsPanelProps = {
  recipeId: string;
  currentPath: string;
  comments: RecipeComment[];
  viewerId: string | null;
  sort: "newest" | "oldest" | "top";
};

function CommentRow({
  comment,
  currentPath,
  viewerId,
  depth = 0,
}: {
  comment: RecipeComment;
  currentPath: string;
  viewerId: string | null;
  depth?: number;
}) {
  const { t } = useTranslations();
  const l = (key: string) => t(`communityPlatformPage.${key}` as never);
  const [, deleteAction] = useActionState<CommentActionState, FormData>(deleteRecipeCommentAction, undefined);
  const isOwner = viewerId === comment.userId;

  return (
    <li className={`rounded-xl border border-ba-espresso/10 bg-white/30 p-4 ${depth > 0 ? "ms-6 mt-3" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/users/${comment.userId}`} className="text-sm font-medium text-ac-espresso hover:underline">
            {comment.authorName ?? l("anonymousMember")}
          </Link>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ac-espresso">{comment.body}</p>
          {comment.isPinned ? <p className="mt-1 text-xs text-amber-700">{l("pinnedLabel")}</p> : null}
        </div>
        <div className="flex items-center gap-3 text-xs text-ac-espresso">
          <span>{comment.likeCount} {l("likesLabel")}</span>
          {viewerId ? (
            <form action={comment.viewerLiked ? unlikeRecipeCommentAction : likeRecipeCommentAction}>
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="currentPath" value={currentPath} />
              <button type="submit" className="underline-offset-2 hover:underline">
                {comment.viewerLiked ? l("unlikeCta") : l("likeCta")}
              </button>
            </form>
          ) : null}
          {isOwner ? (
            <form action={deleteAction}>
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="currentPath" value={currentPath} />
              <button type="submit" className="text-red-700 underline-offset-2 hover:underline">{l("deleteCta")}</button>
            </form>
          ) : null}
        </div>
      </div>
      {comment.replies?.length ? (
        <ul className="mt-3 list-none p-0">
          {comment.replies.map((reply) => (
            <CommentRow key={reply.id} comment={reply} currentPath={currentPath} viewerId={viewerId} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function RecipeCommentsPanel({ recipeId, currentPath, comments, viewerId, sort }: RecipeCommentsPanelProps) {
  const { t } = useTranslations();
  const l = (key: string) => t(`communityPlatformPage.${key}` as never);
  const [state, formAction, pending] = useActionState<CommentActionState, FormData>(createRecipeCommentAction, undefined);

  return (
    <section className="mx-auto mt-10 max-w-3xl rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ac-espresso">{l("commentsTitle")}</h2>
        <div className="flex gap-2 text-xs">
          {(["newest", "oldest", "top"] as const).map((value) => (
            <Link
              key={value}
              href={`${currentPath.split("?")[0]}?commentSort=${value}`}
              className={`rounded-full px-3 py-1 ${sort === value ? "bg-ba-sand/60 text-ac-espresso" : "text-ac-espresso/70 hover:text-ac-espresso"}`}
            >
              {l(`sort_${value}`)}
            </Link>
          ))}
        </div>
      </div>

      {viewerId ? (
        <form action={formAction} className="mt-6 space-y-3">
          <input type="hidden" name="recipeId" value={recipeId} />
          <input type="hidden" name="currentPath" value={currentPath} />
          <label className={forms.label}>
            {l("commentLabel")}
            <textarea name="body" rows={3} className={forms.input} required />
          </label>
          <FormMessage error={state?.error} success={state?.success} />
          <button type="submit" disabled={pending} className={buttons.primary}>
            {pending ? l("postingCta") : l("postCommentCta")}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-ac-espresso">{l("signInToComment")}</p>
      )}

      {comments.length === 0 ? (
        <p className="mt-6 text-sm text-ac-espresso">{l("noCommentsYet")}</p>
      ) : (
        <ul className="mt-6 list-none space-y-4 p-0">
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} currentPath={currentPath} viewerId={viewerId} />
          ))}
        </ul>
      )}
    </section>
  );
}
