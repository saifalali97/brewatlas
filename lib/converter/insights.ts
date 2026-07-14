import type {
  ChangeReasonCode,
  ConfidenceLevel,
  ConversionPreferences,
  ConversionWarningCode,
  FieldInsight,
} from "@/lib/converter/types";

/**
 * Phase 18 explainability layer: turns the raw before/after numbers every
 * device rule already produces into "did this change, why, and how much
 * should you trust it" -- without touching the Phase 17.3 rule modules
 * themselves. Reason attribution here is grounded in how every rule
 * module in `lib/converter/rules/` actually behaves: body/acidity are the
 * only preferences that ever move ratio, grind, temperature, brew time or
 * pour count; sweetness only ever adjusts bloom time.
 */

const RELATIVE_CHANGE_THRESHOLD = 0.06;

/** Whether two numbers differ enough to call it a real recommendation change rather than rounding noise. */
export function isMeaningfulChange(before: number, after: number, absoluteFloor: number): boolean {
  const delta = Math.abs(after - before);
  if (delta < absoluteFloor) return false;
  const scale = Math.max(Math.abs(before), Math.abs(after), absoluteFloor);
  return delta / scale >= RELATIVE_CHANGE_THRESHOLD || delta >= absoluteFloor * 2;
}

/** Reason for a change on ratio/grind/temperature/brew-time/pours -- the fields body and acidity actively drive in every device rule. */
export function reasonForGeneralField(
  preferences: ConversionPreferences,
  categoryChanged: boolean,
): ChangeReasonCode {
  if (categoryChanged) return "categoryChange";
  if (preferences.preserveBody && preferences.preserveAcidity) return "conflictingPreferences";
  if (preferences.preserveBody) return "preserveBody";
  if (preferences.preserveAcidity) return "preserveAcidity";
  return "targetDeviceProfile";
}

/** Reason for a change on bloom -- the one field sweetness actively drives, on top of the same body/acidity/category factors. */
export function reasonForBloomField(
  preferences: ConversionPreferences,
  categoryChanged: boolean,
): ChangeReasonCode {
  const general = reasonForGeneralField(preferences, categoryChanged);
  if (general !== "targetDeviceProfile") return general;
  if (preferences.preserveSweetness) return "preserveSweetness";
  return general;
}

export function buildFieldInsight(changed: boolean, reason: ChangeReasonCode, previousDisplay: string | null): FieldInsight {
  return {
    changed,
    reason: changed ? reason : "unchanged",
    previousDisplay: changed ? previousDisplay : null,
  };
}

export function computeWarnings(params: {
  categoryChanged: boolean;
  conflictingPreferences: boolean;
  ratioClamped: boolean;
  grindClamped: boolean;
  temperatureClamped: boolean;
  brewTimeClamped: boolean;
  bloomCapped: boolean;
}): ConversionWarningCode[] {
  const warnings: ConversionWarningCode[] = [];
  if (params.ratioClamped) warnings.push("ratioClamped");
  if (params.grindClamped) warnings.push("grindClamped");
  if (params.temperatureClamped) warnings.push("temperatureClamped");
  if (params.brewTimeClamped) warnings.push("brewTimeClamped");
  if (params.bloomCapped) warnings.push("bloomCapped");
  if (params.categoryChanged) warnings.push("crossCategoryConversion");
  if (params.conflictingPreferences) warnings.push("conflictingPreferences");
  return warnings;
}

export function computeConfidence(params: {
  categoryChanged: boolean;
  anyClamped: boolean;
  conflictingPreferences: boolean;
  missingSourceDataCount: number;
}): ConfidenceLevel {
  let deductions = 0;
  if (params.categoryChanged) deductions += 1;
  if (params.anyClamped) deductions += 1;
  if (params.conflictingPreferences) deductions += 1;
  if (params.missingSourceDataCount >= 3) deductions += 1;

  if (deductions === 0) return "high";
  if (deductions === 1) return "medium";
  return "low";
}
