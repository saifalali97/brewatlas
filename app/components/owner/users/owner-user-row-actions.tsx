"use client";

import { useState } from "react";
import { buttons } from "@/lib/constants/styles";
import {
  deleteOwnerUserAction,
  restoreOwnerUserAction,
  suspendOwnerUserAction,
} from "@/lib/supabase/owner-user-actions";
import type { OwnerUserListItem } from "@/lib/data/owner-users";
import type { Dictionary } from "@/lib/i18n/types";

type OwnerUserRowActionsProps = {
  user: OwnerUserListItem;
  labels: Dictionary["ownerUsersPage"];
};

export function OwnerUserRowActions({ user, labels }: OwnerUserRowActionsProps) {
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const isSuspended = Boolean(user.suspendedAt);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isSuspended ? (
        <form action={restoreOwnerUserAction}>
          <input type="hidden" name="userId" value={user.id} />
          <button type="submit" className={`${buttons.secondary} text-xs`}>
            {labels.restoreAction}
          </button>
        </form>
      ) : (
        <>
          <button type="button" onClick={() => setShowSuspendForm((value) => !value)} className={`${buttons.secondary} text-xs`}>
            {labels.suspendAction}
          </button>
          {showSuspendForm && (
            <form action={suspendOwnerUserAction} className="flex flex-wrap items-center gap-2">
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
          )}
        </>
      )}

      <form
        action={deleteOwnerUserAction}
        onSubmit={(event) => {
          if (!window.confirm(labels.deleteConfirm)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="userId" value={user.id} />
        <button type="submit" className={`${buttons.secondary} text-xs text-rose-300/90`}>
          {labels.deleteAction}
        </button>
      </form>
    </div>
  );
}
