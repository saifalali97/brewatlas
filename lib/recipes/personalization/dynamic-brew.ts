/**
 * Dynamic Recipe System — live dose / ratio / method / flash calculations
 * and BrewAtlas extraction guidance.
 */

import { formatBeverageRatio, formatGrams } from "@/lib/recipes/personalization/parse";
import type {
  BrewSnapshot,
  DynamicBrewMethod,
  PersonalizedPour,
  RecipeServingStyle,
} from "@/lib/recipes/personalization/types";

export type { DynamicBrewMethod };

export const DYNAMIC_BREW_METHODS: DynamicBrewMethod[] = [
  "v60",
  "origami",
  "kalita",
  "chemex",
  "aeropress",
  "french-press",
];

export const DOSE_PRESETS_G = [15, 18, 20, 22, 25, 30] as const;

/** Ratio denominators (1:x). */
export const RATIO_PRESETS = [14, 15, 15.5, 16, 16.5, 17] as const;

/** Equal hot/ice split for user-driven flash brew (e.g. 20g @ 1:15 → 150 + 150). */
export const FLASH_EQUAL_SPLIT = 0.5;

export type ExtractionGuidance = {
  id: string;
  label: string;
};

type MethodProfile = {
  label: string;
  grind: string;
  tempC: number;
  bloomFactor: number;
  pourCount: number;
  brewTimeSeconds: number;
  agitation: string;
};

const METHOD_PROFILES: Record<DynamicBrewMethod, MethodProfile> = {
  v60: {
    label: "V60",
    grind: "Medium-fine",
    tempC: 93,
    bloomFactor: 2,
    pourCount: 3,
    brewTimeSeconds: 180,
    agitation: "Gentle swirl after bloom and final pour",
  },
  origami: {
    label: "Origami",
    grind: "Medium-fine",
    tempC: 93,
    bloomFactor: 2,
    pourCount: 3,
    brewTimeSeconds: 195,
    agitation: "Keep slurry lively with center-focused pours",
  },
  kalita: {
    label: "Kalita",
    grind: "Medium",
    tempC: 92,
    bloomFactor: 2,
    pourCount: 3,
    brewTimeSeconds: 200,
    agitation: "Flat-bed pours; avoid aggressive stirring",
  },
  chemex: {
    label: "Chemex",
    grind: "Medium-coarse",
    tempC: 94,
    bloomFactor: 2.5,
    pourCount: 3,
    brewTimeSeconds: 240,
    agitation: "Slow concentric pours; no bed digging",
  },
  aeropress: {
    label: "AeroPress",
    grind: "Medium-fine",
    tempC: 90,
    bloomFactor: 0,
    pourCount: 1,
    brewTimeSeconds: 120,
    agitation: "Stir 5–8 seconds, then steep before press",
  },
  "french-press": {
    label: "French Press",
    grind: "Coarse",
    tempC: 94,
    bloomFactor: 0,
    pourCount: 1,
    brewTimeSeconds: 240,
    agitation: "Break crust at 4:00, skim, and plunge slowly",
  },
};

export function methodLabel(method: DynamicBrewMethod): string {
  return METHOD_PROFILES[method].label;
}

export function parseBrewMethodLabel(label: string | null | undefined): DynamicBrewMethod {
  const normalized = (label ?? "v60").toLowerCase().replace(/\s+/g, "-");
  if (normalized.includes("origami")) return "origami";
  if (normalized.includes("kalita")) return "kalita";
  if (normalized.includes("chemex")) return "chemex";
  if (normalized.includes("aero")) return "aeropress";
  if (normalized.includes("french")) return "french-press";
  return "v60";
}

export function roundBrewGrams(value: number): number {
  return Math.max(0, Math.round(value));
}

export function calculateBeverageWaterG(doseG: number, ratio: number): number {
  return roundBrewGrams(doseG * ratio);
}

export function calculateFlashSplit(
  totalBeverageG: number,
  equalSplit = true,
): { hotWaterG: number; iceG: number } {
  if (equalSplit) {
    const half = Math.round(totalBeverageG * FLASH_EQUAL_SPLIT);
    return { hotWaterG: half, iceG: Math.max(0, Math.round(totalBeverageG) - half) };
  }
  const hot = Math.round(totalBeverageG * 0.625);
  return { hotWaterG: hot, iceG: Math.max(0, Math.round(totalBeverageG) - hot) };
}

export function extractRatioDenominator(ratioLabel: string | null | undefined): number | null {
  if (!ratioLabel) return null;
  const match = ratioLabel.match(/1\s*:\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function formatTimeRange(totalSeconds: number): string {
  const low = Math.max(60, totalSeconds - 15);
  const high = totalSeconds + 15;
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };
  return `${fmt(low)}–${fmt(high)}`;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildPours(
  method: DynamicBrewMethod,
  doseG: number,
  hotWaterG: number,
  style: RecipeServingStyle,
): PersonalizedPour[] {
  const profile = METHOD_PROFILES[method];
  const pours: PersonalizedPour[] = [];
  let pourNumber = 1;

  if (style === "iced") {
    pours.push({
      id: "dyn-prep",
      pourNumber: pourNumber++,
      waterAmountG: null,
      waterAmountLabel: "Prep",
      timeLabel: "Prep",
      notes: "Add ice to the server under the dripper, then rinse the filter.",
      atSeconds: 0,
      durationSeconds: 20,
    });
  }

  if (profile.bloomFactor > 0) {
    const bloom = Math.max(20, Math.round(doseG * profile.bloomFactor));
    const remaining = Math.max(0, hotWaterG - bloom);
    const pulseCount = Math.max(1, profile.pourCount);
    const pulse = Math.floor(remaining / pulseCount);
    let cursor = bloom;
    let at = 0;

    pours.push({
      id: "dyn-bloom",
      pourNumber: pourNumber++,
      waterAmountG: bloom,
      waterAmountLabel: formatGrams(bloom) ?? `${bloom} g`,
      timeLabel: `0:00–0:45`,
      notes: "Bloom to wet all grounds; swirl once to degas.",
      atSeconds: 0,
      durationSeconds: 45,
    });
    at = 45;

    for (let i = 0; i < pulseCount; i += 1) {
      const amount = i === pulseCount - 1 ? Math.max(0, hotWaterG - cursor) : pulse;
      cursor += amount;
      const duration = Math.round((profile.brewTimeSeconds - 45) / pulseCount);
      pours.push({
        id: `dyn-pour-${i + 1}`,
        pourNumber: pourNumber++,
        waterAmountG: amount,
        waterAmountLabel: formatGrams(amount) ?? `${amount} g`,
        timeLabel: `${formatClock(at)}–${formatClock(at + duration)}`,
        notes:
          i === pulseCount - 1
            ? "Final pour to target; keep the bed flat."
            : "Center pour in slow circles toward the next total.",
        atSeconds: at,
        durationSeconds: duration,
      });
      at += duration;
    }

    pours.push({
      id: "dyn-drawdown",
      pourNumber: pourNumber++,
      waterAmountG: null,
      waterAmountLabel: "Drawdown",
      timeLabel: `${formatClock(at)}–${formatClock(profile.brewTimeSeconds)}`,
      notes: profile.agitation,
      atSeconds: at,
      durationSeconds: Math.max(15, profile.brewTimeSeconds - at),
    });
  } else if (method === "aeropress") {
    pours.push(
      {
        id: "dyn-fill",
        pourNumber: pourNumber++,
        waterAmountG: hotWaterG,
        waterAmountLabel: formatGrams(hotWaterG) ?? `${hotWaterG} g`,
        timeLabel: "0:00–0:15",
        notes: "Add water, stir gently, and attach the cap.",
        atSeconds: 0,
        durationSeconds: 15,
      },
      {
        id: "dyn-steep",
        pourNumber: pourNumber++,
        waterAmountG: null,
        waterAmountLabel: "Steep",
        timeLabel: "0:15–1:45",
        notes: profile.agitation,
        atSeconds: 15,
        durationSeconds: 90,
      },
      {
        id: "dyn-press",
        pourNumber: pourNumber++,
        waterAmountG: null,
        waterAmountLabel: "Press",
        timeLabel: "1:45–2:00",
        notes: "Press steadily for 20–30 seconds.",
        atSeconds: 105,
        durationSeconds: 30,
      },
    );
  } else {
    pours.push(
      {
        id: "dyn-fill",
        pourNumber: pourNumber++,
        waterAmountG: hotWaterG,
        waterAmountLabel: formatGrams(hotWaterG) ?? `${hotWaterG} g`,
        timeLabel: "0:00–0:20",
        notes: "Add all water and stir to saturate.",
        atSeconds: 0,
        durationSeconds: 20,
      },
      {
        id: "dyn-steep",
        pourNumber: pourNumber++,
        waterAmountG: null,
        waterAmountLabel: "Steep",
        timeLabel: "0:20–4:00",
        notes: profile.agitation,
        atSeconds: 20,
        durationSeconds: 220,
      },
    );
  }

  if (style === "iced") {
    pours.push({
      id: "dyn-swirl",
      pourNumber: pourNumber++,
      waterAmountG: null,
      waterAmountLabel: "Swirl",
      timeLabel: "Finish",
      notes: "Swirl the server to melt ice evenly and chill the cup.",
      atSeconds: profile.brewTimeSeconds,
      durationSeconds: 10,
    });
  }

  return pours;
}

/**
 * Build a live brew snapshot from method + dose + ratio + serving style.
 */
export function buildDynamicBrewSnapshot(input: {
  method: DynamicBrewMethod;
  doseG: number;
  ratio: number;
  servingStyle: RecipeServingStyle;
  grindOverride?: string | null;
  tempOverrideC?: number | null;
}): BrewSnapshot {
  const profile = METHOD_PROFILES[input.method];
  const total = calculateBeverageWaterG(input.doseG, input.ratio);
  const iced = input.servingStyle === "iced";
  const split = iced
    ? calculateFlashSplit(total, true)
    : { hotWaterG: total, iceG: null as number | null };

  const bloom =
    profile.bloomFactor > 0 ? Math.max(20, Math.round(input.doseG * profile.bloomFactor)) : null;
  const tempC = input.tempOverrideC ?? profile.tempC;

  return {
    servingStyle: input.servingStyle,
    coffeeDoseG: input.doseG,
    hotWaterG: split.hotWaterG,
    iceG: iced ? split.iceG : null,
    temperatureC: tempC,
    temperatureLabel: iced ? `${Math.round(tempC)}°C → ice` : `${Math.round(tempC)}°C`,
    ratioLabel: formatBeverageRatio(input.doseG, total),
    grindSize: input.grindOverride ?? profile.grind,
    bloomAmountG: bloom,
    bloomTimeLabel: bloom ? "0:45" : null,
    brewTimeLabel: formatClock(profile.brewTimeSeconds),
    totalBrewTimeLabel: formatTimeRange(profile.brewTimeSeconds),
    pours: buildPours(input.method, input.doseG, split.hotWaterG, input.servingStyle),
    equipment: [
      { name: profile.label, detail: iced ? "Flash brew over ice" : "Hot filter brew" },
      { name: "Scale", detail: "0.1 g accuracy" },
      { name: "Burr grinder", detail: input.grindOverride ?? profile.grind },
      ...(iced ? [{ name: "Ice", detail: formatGrams(split.iceG ?? 0) ?? `${split.iceG} g` }] : []),
    ],
    brewingTips: [
      profile.agitation,
      iced
        ? "Track hot water on the scale only — ice already sits in the server."
        : "Keep pour height low to protect clarity.",
    ],
    extractionNotes: extractionGuidanceLabels(input.ratio).map((g) => g.label),
    waterProfileLabel: "Soft mineral / Third Wave Water",
  };
}

/** Ratio-based BrewAtlas intelligence cues. */
export function extractionGuidance(ratio: number): ExtractionGuidance[] {
  const items: ExtractionGuidance[] = [];
  if (ratio <= 14.5) {
    items.push({ id: "strength", label: "Higher strength" });
    items.push({ id: "body", label: "More body" });
  } else if (ratio >= 16.5) {
    items.push({ id: "clarity", label: "Higher clarity" });
    items.push({ id: "strength", label: "Lower strength" });
  } else {
    items.push({ id: "sweetness", label: "Higher sweetness" });
    items.push({ id: "balance", label: "Balanced extraction" });
  }

  if (ratio >= 15.5 && ratio < 16.5) {
    items.push({ id: "acidity", label: "Higher acidity" });
  } else if (ratio < 15) {
    items.push({ id: "acidity", label: "Softer acidity" });
  }

  return items;
}

export function extractionGuidanceLabels(ratio: number): ExtractionGuidance[] {
  return extractionGuidance(ratio);
}
