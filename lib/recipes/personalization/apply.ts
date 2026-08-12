import {
  buildDynamicBrewSnapshot,
  parseBrewMethodLabel,
} from "@/lib/recipes/personalization/dynamic-brew";
import {
  DEFAULT_PERSONALIZATION_CONFIG,
  personalizeBrewSnapshot as personalizeWithEngine,
} from "@/lib/recipes/personalization/engine";
import { cloneSnapshot } from "@/lib/recipes/personalization/serving-style";
import type {
  BrewSnapshot,
  DynamicBrewMethod,
  PersonalizationAdjustments,
  PersonalizationConfig,
  PersonalizationCopy,
  PersonalizationResult,
} from "@/lib/recipes/personalization/types";

function resolveDoseG(official: BrewSnapshot, adjustments: PersonalizationAdjustments): number {
  if (adjustments.coffeeDoseG !== undefined && adjustments.coffeeDoseG > 0) {
    return adjustments.coffeeDoseG;
  }
  return official.coffeeDoseG && official.coffeeDoseG > 0 ? official.coffeeDoseG : 20;
}

function resolveRatio(
  adjustments: PersonalizationAdjustments,
  engineRatio: number | null,
): number {
  if (adjustments.brewRatio !== undefined && adjustments.brewRatio > 0) {
    return adjustments.brewRatio;
  }
  return engineRatio && engineRatio > 0 ? engineRatio : 15;
}

function resolveMethod(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
): DynamicBrewMethod {
  if (adjustments.brewMethod) return adjustments.brewMethod;
  return parseBrewMethodLabel(official.equipment[0]?.name ?? official.grindSize);
}

/**
 * Pure personalization entry point. Never mutates `official`.
 *
 * Dose / ratio / style / pour scaling use the personalization engine.
 * Brew-method changes optionally rebuild pour structure from method templates
 * (existing Dynamic Recipe System), then re-apply the engine for iced splits.
 */
export function personalizeBrewSnapshot(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
  copy: PersonalizationCopy,
  config: PersonalizationConfig = DEFAULT_PERSONALIZATION_CONFIG,
): PersonalizationResult {
  const officialMethod = parseBrewMethodLabel(
    official.equipment[0]?.name ?? official.grindSize,
  );
  const methodChanged =
    adjustments.brewMethod !== undefined && adjustments.brewMethod !== officialMethod;

  if (methodChanged) {
    const doseG = resolveDoseG(official, adjustments);
    const base = personalizeWithEngine(
      official,
      { ...adjustments, brewMethod: undefined, servingStyle: "hot" },
      copy,
      { ...config, icedSupported: false },
    );
    const ratio = resolveRatio(adjustments, base.adjustments.brewRatio ?? null);
    const style = adjustments.servingStyle ?? official.servingStyle;
    const rebuilt = buildDynamicBrewSnapshot({
      method: resolveMethod(official, adjustments),
      doseG,
      ratio,
      servingStyle: "hot",
      grindOverride: adjustments.grinderLabel ?? official.grindSize,
      tempOverrideC: adjustments.brewTemperatureC ?? official.temperatureC,
    });
    const icedAware = personalizeWithEngine(
      { ...rebuilt, rpm: official.rpm },
      {
        servingStyle: style,
        coffeeDoseG: doseG,
        brewRatio: ratio,
        brewTemperatureC: adjustments.brewTemperatureC,
        pourCount: adjustments.pourCount,
        grindOffset: adjustments.grindOffset,
        grinderLabel: adjustments.grinderLabel,
      },
      copy,
      config,
    );

    return {
      official: cloneSnapshot(official),
      personalized: icedAware.personalized,
      adjustments: {
        ...adjustments,
        servingStyle: icedAware.activeServingStyle,
        coffeeDoseG: doseG,
        brewRatio: ratio,
        brewMethod: adjustments.brewMethod,
        brewTemperatureC: icedAware.adjustments.brewTemperatureC,
        pourCount: icedAware.adjustments.pourCount,
        grindOffset: icedAware.adjustments.grindOffset,
      },
      isPersonalized: true,
      activeServingStyle: icedAware.activeServingStyle,
    };
  }

  return personalizeWithEngine(official, adjustments, copy, config);
}
