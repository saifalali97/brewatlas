"use client";

import { buttons } from "@/lib/constants/styles";
import {
  createAdminDeviceAction,
  deleteAdminDeviceAction,
  updateAdminDeviceAction,
} from "@/lib/supabase/admin-lookup-actions";

const fieldClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none focus:border-amber-500/45";

type AdminDeviceFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    slug: string;
    manufacturer: string | null;
    published: boolean;
  };
  labels: {
    name: string;
    slug: string;
    manufacturer: string;
    published: string;
    save: string;
    create: string;
    delete: string;
    deleteConfirm: string;
  };
};

export function AdminDeviceForm({ mode, initial, labels }: AdminDeviceFormProps) {
  const action = mode === "create" ? createAdminDeviceAction : updateAdminDeviceAction;

  return (
    <div className="mt-8 max-w-2xl rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-6">
      <form action={action} className="space-y-4">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.name}</label>
          <input name="name" required defaultValue={initial?.name ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.slug}</label>
          <input name="slug" defaultValue={initial?.slug ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.manufacturer}</label>
          <input name="manufacturer" defaultValue={initial?.manufacturer ?? ""} className={fieldClass} />
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
        <form
          action={deleteAdminDeviceAction}
          className="mt-4"
          onSubmit={(event) => {
            if (!window.confirm(labels.deleteConfirm)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={initial.id} />
          <button type="submit" className={`${buttons.secondary} text-sm text-rose-300/90`}>
            {labels.delete}
          </button>
        </form>
      ) : null}
    </div>
  );
}
