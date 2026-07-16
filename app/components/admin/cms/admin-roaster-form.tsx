"use client";

import { buttons } from "@/lib/constants/styles";
import {
  createAdminRoasterAction,
  deleteAdminRoasterAction,
  updateAdminRoasterAction,
} from "@/lib/supabase/admin-lookup-actions";

const fieldClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none focus:border-amber-500/45";

type AdminRoasterFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    name: string;
    slug: string | null;
    country: string | null;
    website: string | null;
    logoUrl: string | null;
    description: string | null;
    emirate: string | null;
    city: string | null;
    featured: boolean;
    isUae: boolean;
    published: boolean;
  };
  labels: {
    name: string;
    slug: string;
    country: string;
    website: string;
    logoUrl: string;
    description: string;
    emirate: string;
    city: string;
    featured: string;
    isUae: string;
    published: string;
    save: string;
    create: string;
    delete: string;
    deleteConfirm: string;
  };
};

export function AdminRoasterForm({ mode, initial, labels }: AdminRoasterFormProps) {
  const action = mode === "create" ? createAdminRoasterAction : updateAdminRoasterAction;
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-stone-500">{labels.country}</label>
            <input name="country" defaultValue={initial?.country ?? ""} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">{labels.website}</label>
            <input name="website" defaultValue={initial?.website ?? ""} className={fieldClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.logoUrl}</label>
          <input name="logoUrl" defaultValue={initial?.logoUrl ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">{labels.description}</label>
          <textarea name="description" rows={3} defaultValue={initial?.description ?? ""} className={fieldClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-stone-500">{labels.emirate}</label>
            <input name="emirate" defaultValue={initial?.emirate ?? ""} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">{labels.city}</label>
            <input name="city" defaultValue={initial?.city ?? ""} className={fieldClass} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" name="featured" defaultChecked={initial?.featured ?? false} className="rounded" />
          {labels.featured}
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" name="isUae" defaultChecked={initial?.isUae ?? false} className="rounded" />
          {labels.isUae}
        </label>
        <label className="flex items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="rounded" />
          {labels.published}
        </label>
        <button type="submit" className={`${buttons.primary} text-sm`}>
          {mode === "create" ? labels.create : labels.save}
        </button>
      </form>
      {initial ? (
        <form action={deleteAdminRoasterAction} className="mt-4" onSubmit={(e) => { if (!window.confirm(labels.deleteConfirm)) e.preventDefault(); }}>
          <input type="hidden" name="id" value={initial.id} />
          <button type="submit" className={`${buttons.secondary} text-sm text-rose-300/90`}>{labels.delete}</button>
        </form>
      ) : null}
    </div>
  );
}
