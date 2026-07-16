"use client";

import { buttons } from "@/lib/constants/styles";
import {
  createHomepageHeroAction,
  deleteHomepageHeroAction,
  updateHomepageHeroAction,
} from "@/lib/supabase/homepage-cms-actions";

const fieldClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none focus:border-amber-500/45";

type AdminHeroFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    locale: string;
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    imageUrl: string | null;
    mediaAssetId: string | null;
    ctaLabel: string | null;
    ctaHref: string | null;
    published: boolean;
    position: number;
  };
};

export function AdminHeroForm({ mode, initial }: AdminHeroFormProps) {
  const action = mode === "create" ? createHomepageHeroAction : updateHomepageHeroAction;
  return (
    <div className="mt-8 max-w-2xl rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-6">
      <form action={action} className="space-y-4">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-stone-500">Locale</label>
            <select name="locale" defaultValue={initial?.locale ?? "en"} className={fieldClass}>
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">Position</label>
            <input name="position" type="number" defaultValue={initial?.position ?? 0} className={fieldClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Eyebrow</label>
          <input name="eyebrow" defaultValue={initial?.eyebrow ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Title</label>
          <input name="title" required defaultValue={initial?.title ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Subtitle</label>
          <textarea name="subtitle" rows={2} defaultValue={initial?.subtitle ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Image URL</label>
          <input name="imageUrl" defaultValue={initial?.imageUrl ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Media asset ID (optional)</label>
          <input name="mediaAssetId" defaultValue={initial?.mediaAssetId ?? ""} className={fieldClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-stone-500">CTA label</label>
            <input name="ctaLabel" defaultValue={initial?.ctaLabel ?? ""} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">CTA href</label>
            <input name="ctaHref" defaultValue={initial?.ctaHref ?? ""} className={fieldClass} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? false} className="rounded" />
          Published
        </label>
        <button type="submit" className={`${buttons.primary} text-sm`}>
          {mode === "create" ? "Create hero banner" : "Save hero banner"}
        </button>
      </form>
      {initial ? (
        <form action={deleteHomepageHeroAction} className="mt-4">
          <input type="hidden" name="id" value={initial.id} />
          <button type="submit" className={`${buttons.secondary} text-sm text-rose-300/90`}>Delete</button>
        </form>
      ) : null}
    </div>
  );
}
