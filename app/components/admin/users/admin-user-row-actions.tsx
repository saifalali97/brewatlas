"use client";

import { useState } from "react";
import { buttons } from "@/lib/constants/styles";
import type { AdminCopy } from "@/lib/admin/copy";
import type { OwnerUserListItem } from "@/lib/data/owner-users";
import {
  demoteAdminUserAction,
  promoteAdminUserAction,
  restoreAdminUserAction,
  suspendAdminUserAction,
} from "@/lib/supabase/admin-user-actions";

type AdminUserRowActionsProps = {
  user: OwnerUserListItem;
  actorId: string;
  labels: AdminCopy["users"];
};

export function AdminUserRowActions({ user, actorId, labels }: AdminUserRowActionsProps) {
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const isSuspended = Boolean(user.suspendedAt);
  const isSelf = user.id === actorId;
  const canPromote = user.role === "user";
  const canDemote = user.role === "admin" && !isSelf;
  const isOwner = user.role === "owner";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canPromote ? (
        <form
          action={promoteAdminUserAction}
          onSubmit={(event) => {
            if (!window.confirm(labels.promoteConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="userId" value={user.id} />
          <button type="submit" className={`${buttons.secondary} text-xs`}>
            {labels.promoteAction}
          </button>
        </form>
      ) : null}

      {canDemote ? (
        <form
          action={demoteAdminUserAction}
          onSubmit={(event) => {
            if (!window.confirm(labels.demoteConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="userId" value={user.id} />
          <button type="submit" className={`${buttons.secondary} text-xs text-amber-200/90`}>
            {labels.demoteAction}
          </button>
        </form>
      ) : null}

      {isOwner ? (
        <span className="rounded-full border border-amber-600/30 bg-amber-950/30 px-2 py-1 text-xs text-amber-200/90">
          {labels.ownerRoleNote}
        </span>
      ) : null}

      {isSuspended ? (
        <form action={restoreAdminUserAction}>
          <input type="hidden" name="userId" value={user.id} />
          <button type="submit" className={`${buttons.secondary} text-xs`}>
            {labels.restoreAction}
          </button>
        </form>
      ) : (
        <>
          {!isSelf ? (
            <button
              type="button"
              onClick={() => setShowSuspendForm((value) => !value)}
              className={`${buttons.secondary} text-xs`}
            >
              {labels.suspendAction}
            </button>
          ) : null}
          {showSuspendForm ? (
            <form action={suspendAdminUserAction} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <input
                name="reason"
                type="text"
                placeholder={labels.suspendReasonPlaceholder}
                className="min-w-[12rem] rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-xs text-stone-100"
              />
              <button type="submit" className={`${buttons.primary} text-xs`}>
                {labels.confirmSuspend}
              </button>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}
