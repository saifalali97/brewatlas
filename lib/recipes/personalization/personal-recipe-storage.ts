import type { PersonalizationAdjustments } from "@/lib/recipes/personalization/types";

const SAVE_PREFIX = "brewatlas:my-recipe:";
const CHANGE_EVENT = "brewatlas:my-recipe-change";

export type SavedPersonalRecipe = {
  recipeSlug: string;
  savedAt: string;
  adjustments: PersonalizationAdjustments;
};

function key(slug: string) {
  return `${SAVE_PREFIX}${slug}`;
}

export function readPersonalRecipe(slug: string): SavedPersonalRecipe | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(slug));
    if (!raw) return null;
    return JSON.parse(raw) as SavedPersonalRecipe;
  } catch {
    return null;
  }
}

export function savePersonalRecipe(slug: string, adjustments: PersonalizationAdjustments) {
  if (typeof window === "undefined") return;
  const payload: SavedPersonalRecipe = {
    recipeSlug: slug,
    savedAt: new Date().toISOString(),
    adjustments,
  };
  try {
    window.localStorage.setItem(key(slug), JSON.stringify(payload));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

export function duplicatePersonalRecipe(
  _sourceSlug: string,
  targetSlug: string,
  adjustments: PersonalizationAdjustments,
) {
  savePersonalRecipe(targetSlug, adjustments);
  return `${window.location.origin}/recipes/${targetSlug}`;
}

export function personalRecipeShareUrl(
  slug: string,
  adjustments: PersonalizationAdjustments,
): string {
  const url = new URL(window.location.href);
  url.pathname = `/recipes/${slug}`;
  if (adjustments.servingStyle) url.searchParams.set("style", adjustments.servingStyle);
  if (adjustments.brewMethod) url.searchParams.set("method", adjustments.brewMethod);
  if (adjustments.coffeeDoseG != null) {
    url.searchParams.set("dose", String(adjustments.coffeeDoseG));
  }
  if (adjustments.brewRatio != null) {
    url.searchParams.set("ratio", String(adjustments.brewRatio));
  }
  return url.toString();
}

export function adjustmentsFromSearchParams(
  params: URLSearchParams,
): PersonalizationAdjustments {
  const next: PersonalizationAdjustments = {};
  const style = params.get("style");
  if (style === "hot" || style === "iced") next.servingStyle = style;
  const method = params.get("method");
  if (
    method === "v60" ||
    method === "origami" ||
    method === "kalita" ||
    method === "chemex" ||
    method === "aeropress" ||
    method === "french-press"
  ) {
    next.brewMethod = method;
  }
  const dose = Number(params.get("dose"));
  if (Number.isFinite(dose) && dose > 0) next.coffeeDoseG = dose;
  const ratio = Number(params.get("ratio"));
  if (Number.isFinite(ratio) && ratio > 0) next.brewRatio = ratio;
  return next;
}

/** Read shareable personalization query params in the browser; empty on the server. */
export function adjustmentsFromWindowLocation(): PersonalizationAdjustments {
  if (typeof window === "undefined") return {};
  return adjustmentsFromSearchParams(new URLSearchParams(window.location.search));
}

/**
 * Soft-sync personalization knobs into the URL without a navigation.
 * Only writes params while personalized; clears them on reset so canonical
 * recipe URLs stay clean.
 */
export function syncPersonalizationSearchParams(
  adjustments: PersonalizationAdjustments,
  isPersonalized = true,
) {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const before = url.search;
    if (!isPersonalized) {
      url.searchParams.delete("style");
      url.searchParams.delete("dose");
      url.searchParams.delete("ratio");
      url.searchParams.delete("method");
    } else {
      if (adjustments.servingStyle === "hot" || adjustments.servingStyle === "iced") {
        url.searchParams.set("style", adjustments.servingStyle);
      } else {
        url.searchParams.delete("style");
      }
      if (
        adjustments.coffeeDoseG != null &&
        Number.isFinite(adjustments.coffeeDoseG) &&
        adjustments.coffeeDoseG > 0
      ) {
        url.searchParams.set("dose", String(adjustments.coffeeDoseG));
      } else {
        url.searchParams.delete("dose");
      }
      if (
        adjustments.brewRatio != null &&
        Number.isFinite(adjustments.brewRatio) &&
        adjustments.brewRatio > 0
      ) {
        url.searchParams.set("ratio", String(adjustments.brewRatio));
      } else {
        url.searchParams.delete("ratio");
      }
      if (adjustments.brewMethod) url.searchParams.set("method", adjustments.brewMethod);
      else url.searchParams.delete("method");
    }
    if (url.search !== before) {
      window.history.replaceState(window.history.state, "", url.toString());
    }
  } catch {
    /* ignore */
  }
}
