/** Parsing helpers for stringly brew fields on Gulf/placeholder recipes. */

/** Extracts the first numeric value from a brew string (e.g. "200 g hot + 120 g ice"). */
export function parseFirstNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Parses "200 g hot + 120 g ice" (or similar) into hot water + ice grams. */
export function parseHotAndIce(waterAmount: string | null | undefined): {
  hotWaterG: number | null;
  iceG: number | null;
} {
  if (!waterAmount) return { hotWaterG: null, iceG: null };

  const lower = waterAmount.toLowerCase();
  const numbers = [...waterAmount.replace(/,/g, "").matchAll(/-?\d+(?:\.\d+)?/g)].map((m) => Number(m[0]));

  if (lower.includes("ice") && numbers.length >= 2) {
    return { hotWaterG: numbers[0] ?? null, iceG: numbers[1] ?? null };
  }

  if (lower.includes("ice") && numbers.length === 1) {
    return { hotWaterG: null, iceG: numbers[0] ?? null };
  }

  return { hotWaterG: numbers[0] ?? null, iceG: null };
}

/** Parses bloom strings like "40 g / 0:30". */
export function parseBloom(bloom: string | null | undefined): {
  bloomAmountG: number | null;
  bloomTimeLabel: string | null;
} {
  if (!bloom) return { bloomAmountG: null, bloomTimeLabel: null };
  const amount = parseFirstNumber(bloom);
  const timeMatch = bloom.match(/(\d+:\d{2}|\d+\s*s(?:ec(?:onds)?)?)/i);
  return {
    bloomAmountG: amount,
    bloomTimeLabel: timeMatch?.[1] ?? null,
  };
}

export function formatGrams(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} g` : `${rounded.toFixed(1)} g`;
}

export function formatCelsius(value: number | null | undefined): string | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return `${Math.round(value)}°C`;
}

/** Formats a coffee:beverage ratio label from dose and total liquid. */
export function formatBeverageRatio(doseG: number | null, beverageG: number | null): string | null {
  if (!doseG || !beverageG || doseG <= 0 || beverageG <= 0) return null;
  const ratio = Math.round((beverageG / doseG) * 10) / 10;
  const body = Number.isInteger(ratio) ? `${ratio}` : ratio.toFixed(1);
  return `1:${body}`;
}
