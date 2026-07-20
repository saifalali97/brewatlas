import type { UserBrewingSetup } from "@/types/brewing-setup";
import { getDefaultEquipmentItem } from "@/lib/data/brewing-setup";

/** Formats the user's permanent brewing profile for AI Coach system prompts. */
export function buildBrewingSetupCoachContext(setup: UserBrewingSetup | null): string {
  if (!setup) return "";
  if (!setup.profile && setup.equipment.length === 0) return "";

  const lines: string[] = ["## User Coffee Setup (permanent profile)"];
  const profile = setup.profile;

  if (profile?.experienceLevel) lines.push(`Experience level: ${profile.experienceLevel}`);
  if (profile?.setupContext) lines.push(`Setup context: ${profile.setupContext}`);
  if (profile?.favoriteRoastLevel) lines.push(`Favorite roast: ${profile.favoriteRoastLevel}`);
  if (profile?.favoriteProcessing) lines.push(`Favorite processing: ${profile.favoriteProcessing}`);
  if (profile?.favoriteBrewRatio) lines.push(`Preferred ratio: ${profile.favoriteBrewRatio}`);
  if (profile?.favoriteTemperatureC != null) lines.push(`Preferred temperature: ${profile.favoriteTemperatureC}°C`);
  if (profile?.preferredWaterProfileName) lines.push(`Water: ${profile.preferredWaterProfileName}`);
  if (profile?.favoriteBrewingMethodName) lines.push(`Preferred method: ${profile.favoriteBrewingMethodName}`);
  if (profile?.favoriteOriginLabels.length) {
    lines.push(`Favorite origins: ${profile.favoriteOriginLabels.join(", ")}`);
  }

  const brewer = getDefaultEquipmentItem(setup, "brewer");
  const grinder = getDefaultEquipmentItem(setup, "grinder");
  const kettle = getDefaultEquipmentItem(setup, "kettle");
  const scale = getDefaultEquipmentItem(setup, "scale");
  const filter = getDefaultEquipmentItem(setup, "filter");

  if (brewer) lines.push(`Default brewer: ${brewer.displayName}`);
  if (grinder) lines.push(`Default grinder: ${grinder.displayName}`);
  if (kettle) lines.push(`Kettle: ${kettle.displayName}`);
  if (scale) lines.push(`Scale: ${scale.displayName}`);
  if (filter) lines.push(`Filter: ${filter.displayName}`);

  const activeEquipment = setup.equipment.filter((item) => !item.isRetired);
  if (activeEquipment.length > 1) {
    lines.push(
      `Other gear: ${activeEquipment
        .filter((item) => !item.isDefault)
        .slice(0, 6)
        .map((item) => `${item.category}: ${item.displayName}`)
        .join("; ")}`,
    );
  }

  lines.push("Use this setup automatically — do not re-ask for grinder, brewer, water, or experience unless the user is changing equipment.");

  return lines.join("\n");
}
