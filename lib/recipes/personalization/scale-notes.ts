/**
 * Safe step-note rewriting for personalized pour scaling.
 *
 * Only rewrites gram-tagged numbers that exactly match structured pour
 * amounts / cumulative totals. Free-form text and ambiguous numbers stay put.
 */

import type { PersonalizedPour } from "@/lib/recipes/personalization/types";

/** Matches brew gram tokens such as "150g", "145 g", "250 grams". */
const GRAM_TOKEN_RE = /(\d+(?:\.\d+)?)(\s*)(g(?:rams)?)\b/gi;

function roundBrewValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

function formatScaledNumber(value: number): string {
  const rounded = roundBrewValue(value);
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

/**
 * Build original→scaled gram replacements from aligned pour arrays.
 * Ambiguous originals (same grams mapping to two different targets) are dropped.
 */
export function buildPourGramReplacements(
  originalPours: PersonalizedPour[],
  scaledPours: PersonalizedPour[],
): Map<number, number> {
  const provisional = new Map<number, number>();
  const ambiguous = new Set<number>();

  const remember = (from: number | null | undefined, to: number | null | undefined) => {
    if (from == null || to == null || !(from > 0) || !(to >= 0)) return;
    const key = roundBrewValue(from);
    const value = roundBrewValue(to);
    const existing = provisional.get(key);
    if (existing !== undefined && existing !== value) {
      ambiguous.add(key);
      return;
    }
    provisional.set(key, value);
  };

  let originalCumulative = 0;
  let scaledCumulative = 0;
  const length = Math.min(originalPours.length, scaledPours.length);

  for (let index = 0; index < length; index += 1) {
    const originalAmount = originalPours[index]?.waterAmountG ?? null;
    const scaledAmount = scaledPours[index]?.waterAmountG ?? null;
    remember(originalAmount, scaledAmount);

    if (originalAmount != null && originalAmount > 0) {
      originalCumulative = roundBrewValue(originalCumulative + originalAmount);
    }
    if (scaledAmount != null && scaledAmount > 0) {
      scaledCumulative = roundBrewValue(scaledCumulative + scaledAmount);
    }
    if (originalAmount != null && originalAmount > 0 && scaledAmount != null) {
      remember(originalCumulative, scaledCumulative);
    }
  }

  for (const key of ambiguous) {
    provisional.delete(key);
  }
  return provisional;
}

/**
 * Rewrite a single note: replace gram-tagged numbers that match known
 * structured pour values. Everything else is preserved verbatim.
 */
export function rewriteBrewNoteGrams(
  note: string,
  replacements: Map<number, number>,
): string {
  if (!note || replacements.size === 0) return note;

  return note.replace(GRAM_TOKEN_RE, (match, rawNumber: string, space: string, unit: string) => {
    const parsed = Number(String(rawNumber).replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return match;
    const key = roundBrewValue(parsed);
    const next = replacements.get(key);
    if (next === undefined || next === key) return match;
    return `${formatScaledNumber(next)}${space}${unit}`;
  });
}

/**
 * Apply safe note rewrites onto scaled pours using the pre-scale structured amounts.
 * Returns new pour objects; never mutates inputs.
 */
export function rewriteScaledPourNotes(
  originalPours: PersonalizedPour[],
  scaledPours: PersonalizedPour[],
): PersonalizedPour[] {
  const replacements = buildPourGramReplacements(originalPours, scaledPours);
  if (replacements.size === 0) {
    return scaledPours.map((pour) => ({ ...pour }));
  }

  return scaledPours.map((pour, index) => {
    const original = originalPours[index];
    const sourceNote = original?.notes ?? pour.notes;
    return {
      ...pour,
      notes: rewriteBrewNoteGrams(sourceNote, replacements),
    };
  });
}
