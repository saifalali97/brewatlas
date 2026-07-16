"use client";

import { buttons } from "@/lib/constants/styles";
import {
  createAdminOriginAction,
  deleteAdminOriginAction,
  updateAdminOriginAction,
} from "@/lib/supabase/admin-lookup-actions";

const fieldClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none focus:border-amber-500/45";

type AdminOriginFormProps = {
  mode: "create" | "edit";
  initial?: { id: string; country: string; region: string; description: string | null; published: boolean };
  labels: {
    country: string;
    region: string;
    description: string;
    published: string;
    save: string;
    create: string;
    delete: string;
    deleteConfirm: string;
  };
};

export function AdminOriginForm({ mode, initial, labels }: AdminOriginFormProps) {
  const action = mode === "create" ? createAdminOriginAction : updateAdminOriginAction;
  return (
    <div className="mt-8 max-w-2xl rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-6">
      <form action={action} className="space-y-4">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.country}</label>
          <input name="country" required defaultValue={initial?.country ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.region}</label>
          <input name="region" required defaultValue={initial?.region ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.description}</label>
          <textarea name="description" rows={4} defaultValue={initial?.description ?? ""} className={fieldClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="rounded" />
          {labels.published}
        </label>
        <button type="submit" className={`${buttons.primary} text-sm`}>
          {mode === "create" ? labels.create : labels.save}
        </button>
      </form>
      {initial ? (
        <form action={deleteAdminOriginAction} className="mt-4" onSubmit={(e) => { if (!window.confirm(labels.deleteConfirm)) e.preventDefault(); }}>
          <input type="hidden" name="id" value={initial.id} />
          <button type="submit" className={`${buttons.secondary} text-sm text-rose-300/90`}>{labels.delete}</button>
        </form>
      ) : null}
    </div>
  );
}
