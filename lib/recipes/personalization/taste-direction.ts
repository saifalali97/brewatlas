/**
 * Relative taste-direction guidance from official → personalized brew.
 * Indicators are heuristic guidance, not laboratory measurements.
 */

import { inferOfficialRatio, roundBrewValue } from "@/lib/recipes/personalization/engine";
import { baselinePourCount, countNumericPours } from "@/lib/recipes/personalization/pours";
import { clampGrindOffset } from "@/lib/recipes/personalization/grind";
import type {
  BrewSnapshot,
  PersonalizationAdjustments,
  RecipeServingStyle,
} from "@/lib/recipes/personalization/types";

export type TasteMetricKey =
  | "sweetness"
  | "acidity"
  | "body"
  | "bitterness"
  | "extraction";

export type TasteMetric = {
  key: TasteMetricKey;
  label: string;
  /** 0–100 guidance indicator (50 ≈ official baseline). */
  value: number;
  delta: number;
};

export type TasteBullet = {
  id: string;
  text: string;
};

export type TasteDirectionResult = {
  metrics: TasteMetric[];
  bullets: TasteBullet[];
  summary: string;
};

type TasteCopy = {
  sweetness: string;
  acidity: string;
  body: string;
  bitterness: string;
  extraction: string;
  summaryFuller: string;
  summaryBrighter: string;
  summarySofter: string;
  summaryBalanced: string;
  summaryIced: string;
  tempUpExtraction: string;
  tempUpBody: string;
  tempUpBitterness: string;
  tempUpAcidity: string;
  tempDownExtraction: string;
  tempDownAcidity: string;
  tempDownBody: string;
  tempDownBitterness: string;
  poursUpAgitation: string;
  poursUpExtraction: string;
  poursDownAgitation: string;
  poursDownExtraction: string;
  ratioUpDilution: string;
  ratioUpClarity: string;
  ratioDownStrength: string;
  ratioDownIntensity: string;
  doseUpStrength: string;
  doseDownStrength: string;
  grindFinerExtraction: string;
  grindFinerBitterness: string;
  grindCoarserExtraction: string;
  grindCoarserAcidity: string;
  icedDilution: string;
};

const DEFAULT_COPY: TasteCopy = {
  sweetness: "Sweetness",
  acidity: "Acidity",
  body: "Body",
  bitterness: "Bitterness",
  extraction: "Extraction",
  summaryFuller:
    "Your brew is moving toward a fuller, more extracted cup with a slightly higher bitterness risk.",
  summaryBrighter:
    "Your brew is moving toward a brighter, lighter cup with potentially clearer acidity.",
  summarySofter:
    "Your brew is moving toward a softer, less intense cup with lower extraction pressure.",
  summaryBalanced: "Your brew stays close to the roaster’s balance with only subtle shifts.",
  summaryIced: " Iced service may increase perceived clarity through dilution.",
  tempUpExtraction: "Higher temperature may increase extraction.",
  tempUpBody: "Higher temperature tends toward more body.",
  tempUpBitterness: "Higher temperature carries a higher bitterness/astringency risk.",
  tempUpAcidity: "Higher temperature may reduce perceived acidity.",
  tempDownExtraction: "Lower temperature may decrease extraction.",
  tempDownAcidity: "Lower temperature may taste brighter/more acidic.",
  tempDownBody: "Lower temperature tends toward a lighter body.",
  tempDownBitterness: "Lower temperature lowers bitterness risk.",
  poursUpAgitation: "More pours may increase agitation.",
  poursUpExtraction: "More pours may increase extraction and intensity.",
  poursDownAgitation: "Fewer pours may reduce agitation.",
  poursDownExtraction: "Fewer pours may produce a cleaner/softer cup.",
  ratioUpDilution: "A higher ratio lowers strength/concentration.",
  ratioUpClarity: "A higher ratio may increase clarity through dilution.",
  ratioDownStrength: "A lower ratio raises strength/concentration.",
  ratioDownIntensity: "A lower ratio tends toward a more intense cup.",
  doseUpStrength: "A higher dose may increase overall strength.",
  doseDownStrength: "A lower dose may lighten overall strength.",
  grindFinerExtraction: "A finer grind may increase extraction.",
  grindFinerBitterness: "A finer grind carries a higher bitterness/astringency risk if pushed too far.",
  grindCoarserExtraction: "A coarser grind may decrease extraction.",
  grindCoarserAcidity:
    "A coarser grind may lean toward more acidity/under-extraction character if too coarse.",
  icedDilution: "Iced service may increase perceived clarity through dilution on ice.",
};

function clampMetric(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function officialDose(official: BrewSnapshot): number {
  return official.coffeeDoseG && official.coffeeDoseG > 0 ? official.coffeeDoseG : 20;
}

function officialRatio(official: BrewSnapshot): number {
  return inferOfficialRatio(official) ?? 15;
}

function officialTemp(official: BrewSnapshot): number | null {
  return official.temperatureC != null && Number.isFinite(official.temperatureC)
    ? official.temperatureC
    : null;
}

/**
 * Compare personalized adjustments against the immutable official snapshot.
 */
export function calculateTasteDirection(
  official: BrewSnapshot,
  personalized: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
  copy: Partial<TasteCopy> = {},
): TasteDirectionResult {
  const labels = { ...DEFAULT_COPY, ...copy };
  const baseDose = officialDose(official);
  const baseRatio = officialRatio(official);
  const baseTemp = officialTemp(official);
  const basePours = baselinePourCount(official);
  const persDose = personalized.coffeeDoseG && personalized.coffeeDoseG > 0 ? personalized.coffeeDoseG : baseDose;
  const persRatio =
    inferOfficialRatio(personalized) ??
    (adjustments.brewRatio != null && adjustments.brewRatio > 0 ? adjustments.brewRatio : baseRatio);
  const persTemp = personalized.temperatureC;
  const persPours = countNumericPours(personalized.pours) || basePours;
  const grindOffset = clampGrindOffset(adjustments.grindOffset);
  const style: RecipeServingStyle = personalized.servingStyle;

  const doseDelta = (persDose - baseDose) / Math.max(baseDose, 1);
  const ratioDelta = (persRatio - baseRatio) / Math.max(baseRatio, 1);
  const tempDelta =
    baseTemp != null && persTemp != null ? (persTemp - baseTemp) / 6 : 0;
  const pourDelta = (persPours - basePours) / 2;
  const grindDelta = -grindOffset / 2; // finer (negative offset) → more extraction
  const icedBias = style === "iced" && official.servingStyle !== "iced" ? 1 : 0;
  const hotBias = style === "hot" && official.servingStyle === "iced" ? 1 : 0;

  let extraction = 50 + tempDelta * 12 + grindDelta * 14 + pourDelta * 8 - ratioDelta * 6 + doseDelta * 4;
  let body = 50 + tempDelta * 10 + doseDelta * 10 - ratioDelta * 12 + pourDelta * 5 - icedBias * 8 + hotBias * 4;
  let bitterness = 50 + tempDelta * 12 + grindDelta * 12 + doseDelta * 6 - ratioDelta * 4 + pourDelta * 4;
  let acidity = 50 - tempDelta * 10 - grindDelta * 8 + ratioDelta * 6 - doseDelta * 3 + icedBias * 6;
  let sweetness = 50 + (1 - Math.abs(extraction - 50) / 50) * 8 - Math.max(0, bitterness - 55) * 0.4 + doseDelta * 3;

  if (style === "iced") {
    extraction -= 3;
    body -= 6;
    bitterness -= 4;
    acidity += 5;
    sweetness -= 2;
  }

  const metrics: TasteMetric[] = [
    {
      key: "sweetness",
      label: labels.sweetness,
      value: clampMetric(sweetness),
      delta: clampMetric(sweetness) - 50,
    },
    {
      key: "acidity",
      label: labels.acidity,
      value: clampMetric(acidity),
      delta: clampMetric(acidity) - 50,
    },
    {
      key: "body",
      label: labels.body,
      value: clampMetric(body),
      delta: clampMetric(body) - 50,
    },
    {
      key: "bitterness",
      label: labels.bitterness,
      value: clampMetric(bitterness),
      delta: clampMetric(bitterness) - 50,
    },
    {
      key: "extraction",
      label: labels.extraction,
      value: clampMetric(extraction),
      delta: clampMetric(extraction) - 50,
    },
  ];

  const bullets: TasteBullet[] = [];
  const push = (id: string, text: string) => {
    if (!bullets.some((item) => item.id === id)) bullets.push({ id, text });
  };

  if (baseTemp != null && persTemp != null) {
    const d = roundBrewValue(persTemp - baseTemp);
    if (d >= 1) {
      push("temp-up-x", labels.tempUpExtraction);
      push("temp-up-b", labels.tempUpBody);
      push("temp-up-bit", labels.tempUpBitterness);
      push("temp-up-a", labels.tempUpAcidity);
    } else if (d <= -1) {
      push("temp-down-x", labels.tempDownExtraction);
      push("temp-down-a", labels.tempDownAcidity);
      push("temp-down-b", labels.tempDownBody);
      push("temp-down-bit", labels.tempDownBitterness);
    }
  }

  if (persPours > basePours) {
    push("pours-up-a", labels.poursUpAgitation);
    push("pours-up-x", labels.poursUpExtraction);
  } else if (persPours < basePours) {
    push("pours-down-a", labels.poursDownAgitation);
    push("pours-down-x", labels.poursDownExtraction);
  }

  if (roundBrewValue(persRatio - baseRatio) >= 0.2) {
    push("ratio-up-d", labels.ratioUpDilution);
    push("ratio-up-c", labels.ratioUpClarity);
  } else if (roundBrewValue(baseRatio - persRatio) >= 0.2) {
    push("ratio-down-s", labels.ratioDownStrength);
    push("ratio-down-i", labels.ratioDownIntensity);
  }

  if (roundBrewValue(persDose - baseDose) >= 0.5) {
    push("dose-up", labels.doseUpStrength);
  } else if (roundBrewValue(baseDose - persDose) >= 0.5) {
    push("dose-down", labels.doseDownStrength);
  }

  if (grindOffset <= -1) {
    push("grind-fine-x", labels.grindFinerExtraction);
    push("grind-fine-b", labels.grindFinerBitterness);
  } else if (grindOffset >= 1) {
    push("grind-coarse-x", labels.grindCoarserExtraction);
    push("grind-coarse-a", labels.grindCoarserAcidity);
  }

  if (style === "iced") {
    push("iced", labels.icedDilution);
  }

  const extractionMetric = metrics.find((item) => item.key === "extraction")!;
  const bodyMetric = metrics.find((item) => item.key === "body")!;
  const bitternessMetric = metrics.find((item) => item.key === "bitterness")!;
  const acidityMetric = metrics.find((item) => item.key === "acidity")!;

  let summary = labels.summaryBalanced;
  if (extractionMetric.delta >= 6 && bodyMetric.delta >= 4) {
    summary = labels.summaryFuller;
  } else if (acidityMetric.delta >= 6 && bodyMetric.delta <= -2) {
    summary = labels.summaryBrighter;
  } else if (extractionMetric.delta <= -6 || bitternessMetric.delta <= -6) {
    summary = labels.summarySofter;
  }
  if (style === "iced" && official.servingStyle !== "iced") {
    summary = `${summary}${labels.summaryIced}`;
  }

  return {
    metrics,
    bullets: bullets.slice(0, 8),
    summary,
  };
}
