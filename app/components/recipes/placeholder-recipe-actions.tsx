"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, Printer, Share2 } from "lucide-react";
import { buttons } from "@/lib/constants/styles";

type PlaceholderRecipeActionsProps = {
  recipeSlug: string;
  recipeName: string;
  saveLabel: string;
  savedLabel: string;
  shareLabel: string;
  printLabel: string;
};

function storageKey(slug: string) {
  return `brewatlas:saved-recipe:${slug}`;
}

/** Client-only save / share / print controls for placeholder recipe pages. */
export function PlaceholderRecipeActions({
  recipeSlug,
  recipeName,
  saveLabel,
  savedLabel,
  shareLabel,
  printLabel,
}: PlaceholderRecipeActionsProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(storageKey(recipeSlug)) === "1");
    } catch {
      setSaved(false);
    }
  }, [recipeSlug]);

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    try {
      if (next) window.localStorage.setItem(storageKey(recipeSlug), "1");
      else window.localStorage.removeItem(storageKey(recipeSlug));
    } catch {
      /* ignore quota / private mode */
    }
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: recipeName, url });
        return;
      } catch {
        /* user cancelled or share failed — fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <button type="button" onClick={toggleSave} className={`${buttons.primary} gap-2`}>
        {saved ? <Check className="h-4 w-4" aria-hidden /> : <Bookmark className="h-4 w-4" aria-hidden />}
        {saved ? savedLabel : saveLabel}
      </button>
      <button type="button" onClick={share} className={`${buttons.secondary} gap-2`}>
        <Share2 className="h-4 w-4" aria-hidden />
        {shareLabel}
      </button>
      <button type="button" onClick={() => window.print()} className={`${buttons.secondary} gap-2`}>
        <Printer className="h-4 w-4" aria-hidden />
        {printLabel}
      </button>
    </div>
  );
}
