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
  if (adjustments.brewTemperatureC != null) {
    url.searchParams.set("temp", String(adjustments.brewTemperatureC));
  }
  if (adjustments.pourCount != null) {
    url.searchParams.set("pours", String(adjustments.pourCount));
  }
  if (adjustments.grindOffset != null && adjustments.grindOffset !== 0) {
    url.searchParams.set("grind", String(adjustments.grindOffset));
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
  const temp = Number(params.get("temp"));
  if (Number.isFinite(temp) && temp > 0) next.brewTemperatureC = Math.round(temp);
  const pours = Number(params.get("pours"));
  if (Number.isFinite(pours) && pours >= 1 && pours <= 5) {
    next.pourCount = Math.round(pours);
  }
  const grind = Number(params.get("grind"));
  if (Number.isFinite(grind) && grind !== 0 && grind >= -2 && grind <= 2) {
    next.grindOffset = Math.round(grind);
  }
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
      url.searchParams.delete("temp");
      url.searchParams.delete("pours");
      url.searchParams.delete("grind");
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
      if (
        adjustments.brewTemperatureC != null &&
        Number.isFinite(adjustments.brewTemperatureC)
      ) {
        url.searchParams.set("temp", String(Math.round(adjustments.brewTemperatureC)));
      } else {
        url.searchParams.delete("temp");
      }
      if (
        adjustments.pourCount != null &&
        Number.isFinite(adjustments.pourCount) &&
        adjustments.pourCount >= 1
      ) {
        url.searchParams.set("pours", String(Math.round(adjustments.pourCount)));
      } else {
        url.searchParams.delete("pours");
      }
      if (
        adjustments.grindOffset != null &&
        Number.isFinite(adjustments.grindOffset) &&
        adjustments.grindOffset !== 0
      ) {
        url.searchParams.set("grind", String(Math.round(adjustments.grindOffset)));
      } else {
        url.searchParams.delete("grind");
      }
    }
    if (url.search !== before) {
      window.history.replaceState(window.history.state, "", url.toString());
    }
  } catch {
    /* ignore */
  }
}
