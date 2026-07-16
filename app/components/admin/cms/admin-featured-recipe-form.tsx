"use client";

import { buttons } from "@/lib/constants/styles";
import {
  createHomepageFeaturedRecipeAction,
  deleteHomepageFeaturedRecipeAction,
  updateHomepageFeaturedRecipeAction,
} from "@/lib/supabase/homepage-cms-actions";

const fieldClass =
  "w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100 outline-none focus:border-amber-500/45";

type AdminFeaturedRecipeFormProps = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    locale: string;
    recipeId: string | null;
    displayName: string | null;
    displayImageUrl: string | null;
    mediaAssetId: string | null;
    displayCountry: string | null;
    displayOrigin: string | null;
    displayBrewMethod: string | null;
    displayNotes: string | null;
    published: boolean;
    position: number;
  };
};

export function AdminFeaturedRecipeForm({ mode, initial }: AdminFeaturedRecipeFormProps) {
  const action = mode === "create" ? createHomepageFeaturedRecipeAction : updateHomepageFeaturedRecipeAction;
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
          <label className="mb-1 block text-xs text-stone-500">Linked recipe ID (optional)</label>
          <input name="recipeId" defaultValue={initial?.recipeId ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Display name</label>
          <input name="displayName" defaultValue={initial?.displayName ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Image URL</label>
          <input name="displayImageUrl" defaultValue={initial?.displayImageUrl ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Media asset ID</label>
          <input name="mediaAssetId" defaultValue={initial?.mediaAssetId ?? ""} className={fieldClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-stone-500">Country</label>
            <input name="displayCountry" defaultValue={initial?.displayCountry ?? ""} className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-stone-500">Origin</label>
            <input name="displayOrigin" defaultValue={initial?.displayOrigin ?? ""} className={fieldClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Brew method</label>
          <input name="displayBrewMethod" defaultValue={initial?.displayBrewMethod ?? ""} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-stone-500">Notes</label>
          <textarea name="displayNotes" rows={3} defaultValue={initial?.displayNotes ?? ""} className={fieldClass} />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-300">
          <input type="checkbox" name="published" defaultChecked={initial?.published ?? true} className="rounded" />
          Published
        </label>
        <button type="submit" className={`${buttons.primary} text-sm`}>
          {mode === "create" ? "Add featured recipe" : "Save featured recipe"}
        </button>
      </form>
      {initial ? (
        <form action={deleteHomepageFeaturedRecipeAction} className="mt-4">
          <input type="hidden" name="id" value={initial.id} />
          <button type="submit" className={`${buttons.secondary} text-sm text-rose-300/90`}>Delete</button>
        </form>
      ) : null}
    </div>
  );
}
