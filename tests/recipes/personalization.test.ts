import { describe, expect, it } from "vitest";
import {
  brewSnapshotFromPlaceholder,
  FLASH_HOT_WATER_FRACTION,
  personalizeBrewSnapshot,
  type PersonalizationCopy,
} from "@/lib/recipes/personalization";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";

const copy: PersonalizationCopy = {
  hotWaterLabel: "Hot Water",
  iceLabel: "Ice",
  iceEquipmentName: "Ice",
  iceEquipmentDetailTemplate: "{ice} in the server",
  flashPrepNotesTemplate: "Add {ice} ice to the server.",
  flashSwirlNotes: "Swirl to chill.",
  flashTipScale: "Track hot water only.",
  flashTipChill: "Use hard ice.",
  flashExtractionNote: "Brighter iced cup.",
  hotTipRestore: "Back to hot.",
  hotExtractionNote: "Full hot body.",
};

function hotRecipe(): PlaceholderRecipeDetail {
  return {
    slug: "test-hot",
    name: "Test Hot",
    lead: "Lead",
    image: "/images/methods/pour-over.webp",
    roasterName: "Test",
    roasterSlug: "test",
    countrySlug: "uae",
    city: "Dubai",
    brewMethod: "V60",
    difficulty: "Intermediate",
    rating: 4.5,
    brewTime: "3:00",
    isIced: false,
    coffeeBeans: "Test",
    roastLevel: "Light",
    origin: "Ethiopia",
    process: "Washed",
    roastDate: "2026-01-01",
    water: "Balanced",
    grinder: "Burr",
    brewer: "V60",
    filter: "Paper",
    dose: "15 g",
    waterAmount: "250 g",
    temperature: "93°C",
    ratio: "1:16.7",
    grindSize: "Medium",
    bloom: "40 g / 0:30",
    totalBrewTime: "3:00",
    steps: [
      {
        id: "s1",
        pourNumber: 1,
        waterAmount: "40 g",
        timeLabel: "0:00–0:30",
        notes: "Bloom",
        atSeconds: 0,
        durationSeconds: 30,
      },
      {
        id: "s2",
        pourNumber: 2,
        waterAmount: "210 g",
        timeLabel: "0:30–2:30",
        notes: "Finish",
        atSeconds: 30,
        durationSeconds: 120,
      },
    ],
    flavorProfile: { sweetness: 70, acidity: 70, body: 60, bitterness: 25, finish: 65 },
    tastingNotes: "Notes",
    flavorTags: [],
    equipment: [
      { name: "Hario V60", detail: "02" },
      { name: "Scale", detail: "0.1 g" },
    ],
    similarSlugs: [],
  };
}

describe("recipe personalization engine", () => {
  it("keeps the official hot recipe when Hot is selected", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(official, { servingStyle: "hot" }, copy);
    expect(result.isPersonalized).toBe(false);
    expect(result.personalized.hotWaterG).toBe(250);
    expect(result.personalized.iceG).toBeNull();
  });

  it("converts hot to iced flash brew without mutating the official snapshot", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(official, { servingStyle: "iced" }, copy);

    expect(result.isPersonalized).toBe(true);
    expect(result.official.hotWaterG).toBe(250);
    expect(result.official.iceG).toBeNull();

    const expectedHot = Math.round(250 * FLASH_HOT_WATER_FRACTION);
    const expectedIce = 250 - expectedHot;
    expect(result.personalized.hotWaterG).toBe(expectedHot);
    expect(result.personalized.iceG).toBe(expectedIce);
    expect(result.personalized.servingStyle).toBe("iced");
    expect(result.personalized.pours[0]?.waterAmountLabel).toBe("Prep");
    expect(result.personalized.equipment.some((item) => item.name === "Ice")).toBe(true);
  });

  it("resets to official when serving style matches the source recipe", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const iced = personalizeBrewSnapshot(official, { servingStyle: "iced" }, copy);
    const reset = personalizeBrewSnapshot(official, { servingStyle: "hot" }, copy);
    expect(iced.isPersonalized).toBe(true);
    expect(reset.isPersonalized).toBe(false);
    expect(reset.personalized.hotWaterG).toBe(official.hotWaterG);
  });

  it("recalculates equal flash brew from dose and ratio", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { servingStyle: "iced", coffeeDoseG: 28, brewRatio: 15 },
      copy,
    );
    expect(result.personalized.coffeeDoseG).toBe(28);
    expect(result.personalized.hotWaterG).toBe(210);
    expect(result.personalized.iceG).toBe(210);
    expect(result.personalized.ratioLabel).toMatch(/1:15/);
  });

  it("rebuilds pour structure when brew method changes", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { brewMethod: "chemex", coffeeDoseG: 30, brewRatio: 16 },
      copy,
    );
    expect(result.isPersonalized).toBe(true);
    expect(result.personalized.hotWaterG).toBe(480);
    expect(result.personalized.equipment[0]?.name).toBe("Chemex");
  });
});
