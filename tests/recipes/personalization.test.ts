import { describe, expect, it } from "vitest";
import {
  brewSnapshotFromPlaceholder,
  calculateTotalWaterG,
  DEFAULT_PERSONALIZATION_CONFIG,
  personalizeBrewSnapshot,
  rewriteBrewNoteGrams,
  roundBrewValue,
  scalePoursProportionally,
  splitHotAndIce,
  validatePersonalizationInputs,
  type PersonalizationCopy,
  type PersonalizedPour,
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

function hotRecipe(overrides: Partial<PlaceholderRecipeDetail> = {}): PlaceholderRecipeDetail {
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
    dose: "20 g",
    waterAmount: "150 g",
    temperature: "93°C",
    ratio: "1:7.5",
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
        waterAmount: "40 g",
        timeLabel: "0:30–1:00",
        notes: "Pour 2",
        atSeconds: 30,
        durationSeconds: 30,
      },
      {
        id: "s3",
        pourNumber: 3,
        waterAmount: "40 g",
        timeLabel: "1:00–1:30",
        notes: "Pour 3",
        atSeconds: 60,
        durationSeconds: 30,
      },
      {
        id: "s4",
        pourNumber: 4,
        waterAmount: "30 g",
        timeLabel: "1:30–2:00",
        notes: "Pour 4",
        atSeconds: 90,
        durationSeconds: 30,
      },
    ],
    flavorProfile: { sweetness: 70, acidity: 70, body: 60, bitterness: 25, finish: 65 },
    tastingNotes: "Notes",
    flavorTags: [],
    equipment: [{ name: "Hario V60", detail: "02" }],
    similarSlugs: [],
    ...overrides,
  };
}

describe("dose × ratio water calculation", () => {
  it("computes 20g × 7.5 = 150g", () => {
    expect(calculateTotalWaterG(20, 7.5)).toBe(150);
  });

  it("computes 18g × 7.5 = 135g", () => {
    expect(calculateTotalWaterG(18, 7.5)).toBe(135);
  });

  it("computes 15g × 7.5 = 112.5g without floating noise", () => {
    expect(calculateTotalWaterG(15, 7.5)).toBe(112.5);
    expect(roundBrewValue(15 * 7.5)).toBe(112.5);
  });
});

describe("pour proportional scaling", () => {
  it("scales 40/40/40/30 from 150g to 36/36/36/27 at 135g", () => {
    const pours: PersonalizedPour[] = [
      {
        id: "1",
        pourNumber: 1,
        waterAmountG: 40,
        waterAmountLabel: "40 g",
        timeLabel: "",
        notes: "",
        atSeconds: 0,
        durationSeconds: 30,
      },
      {
        id: "2",
        pourNumber: 2,
        waterAmountG: 40,
        waterAmountLabel: "40 g",
        timeLabel: "",
        notes: "",
        atSeconds: 30,
        durationSeconds: 30,
      },
      {
        id: "3",
        pourNumber: 3,
        waterAmountG: 40,
        waterAmountLabel: "40 g",
        timeLabel: "",
        notes: "",
        atSeconds: 60,
        durationSeconds: 30,
      },
      {
        id: "4",
        pourNumber: 4,
        waterAmountG: 30,
        waterAmountLabel: "30 g",
        timeLabel: "",
        notes: "",
        atSeconds: 90,
        durationSeconds: 30,
      },
    ];
    const scaled = scalePoursProportionally(pours, 150, 135);
    expect(scaled.map((p) => p.waterAmountG)).toEqual([36, 36, 36, 27]);
    expect(scaled.reduce((sum, p) => sum + (p.waterAmountG ?? 0), 0)).toBe(135);
  });
});

describe("iced water split config", () => {
  it("splits total water by icedWaterPercentage and totals exactly", () => {
    const split = splitHotAndIce(300, 50);
    expect(split.hotWaterG).toBe(150);
    expect(split.iceG).toBe(150);
    expect(split.hotWaterG + split.iceG).toBe(300);
  });

  it("supports non-50 configurations", () => {
    const split = splitHotAndIce(300, 40);
    expect(split.iceG).toBe(120);
    expect(split.hotWaterG).toBe(180);
  });
});

describe("recipe personalization engine", () => {
  it("keeps the official hot recipe when Hot is selected at original dose/ratio", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { servingStyle: "hot", coffeeDoseG: 20, brewRatio: 7.5 },
      copy,
    );
    expect(result.isPersonalized).toBe(false);
    expect(result.personalized.hotWaterG).toBe(150);
    expect(result.personalized.iceG).toBeNull();
    expect(result.official.hotWaterG).toBe(150);
  });

  it("scales dose and pours without mutating the official snapshot", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { servingStyle: "hot", coffeeDoseG: 18, brewRatio: 7.5 },
      copy,
    );

    expect(result.isPersonalized).toBe(true);
    expect(result.official.coffeeDoseG).toBe(20);
    expect(result.official.hotWaterG).toBe(150);
    expect(result.personalized.coffeeDoseG).toBe(18);
    expect(result.personalized.hotWaterG).toBe(135);
    expect(
      result.personalized.pours
        .filter((p) => p.waterAmountG != null)
        .map((p) => p.waterAmountG),
    ).toEqual([36, 36, 36, 27]);
  });

  it("converts hot to iced using configurable iced percentage", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { servingStyle: "iced", coffeeDoseG: 20, brewRatio: 7.5 },
      copy,
      { ...DEFAULT_PERSONALIZATION_CONFIG, icedWaterPercentage: 50 },
    );

    expect(result.isPersonalized).toBe(true);
    expect(result.official.iceG).toBeNull();
    expect(result.personalized.hotWaterG).toBe(75);
    expect(result.personalized.iceG).toBe(75);
    expect(result.personalized.pours[0]?.waterAmountLabel).toBe("Prep");
    expect(result.personalized.equipment.some((item) => item.name === "Ice")).toBe(true);
  });

  it("resets to official when style/dose/ratio match the source recipe", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const iced = personalizeBrewSnapshot(official, { servingStyle: "iced" }, copy);
    const reset = personalizeBrewSnapshot(
      official,
      { servingStyle: "hot", coffeeDoseG: 20, brewRatio: 7.5 },
      copy,
    );
    expect(iced.isPersonalized).toBe(true);
    expect(reset.isPersonalized).toBe(false);
    expect(reset.personalized.hotWaterG).toBe(official.hotWaterG);
  });

  it("preserves temperature and grind by default", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { servingStyle: "hot", coffeeDoseG: 18, brewRatio: 7.5 },
      copy,
    );
    expect(result.personalized.temperatureC).toBe(93);
    expect(result.personalized.grindSize).toBe("Medium");
  });

  it("handles recipes without pours", () => {
    const official = brewSnapshotFromPlaceholder(
      hotRecipe({
        steps: [],
        dose: "15 g",
        waterAmount: "225 g",
        ratio: "1:15",
      }),
    );
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 18, brewRatio: 15 },
      copy,
    );
    expect(result.personalized.hotWaterG).toBe(270);
    expect(result.personalized.pours).toEqual([]);
  });

  it("does not mark fallback dose/ratio as personalized when official omits them", () => {
    const official = brewSnapshotFromPlaceholder(
      hotRecipe({
        steps: [],
        dose: "—",
        waterAmount: "—",
        temperature: "—",
        ratio: "—",
        bloom: "—",
      }),
    );
    expect(official.coffeeDoseG).toBeNull();
    const result = personalizeBrewSnapshot(
      official,
      { servingStyle: "hot", coffeeDoseG: 20, brewRatio: 15 },
      copy,
    );
    expect(result.isPersonalized).toBe(false);
  });

  it("rejects invalid personalization inputs", () => {
    expect(validatePersonalizationInputs({ doseG: 0, ratio: 7.5, icedWaterPercentage: 50 }).ok).toBe(
      false,
    );
    expect(validatePersonalizationInputs({ doseG: 20, ratio: -1, icedWaterPercentage: 50 }).ok).toBe(
      false,
    );
    expect(
      validatePersonalizationInputs({ doseG: 20, ratio: 7.5, icedWaterPercentage: 120 }).ok,
    ).toBe(false);
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

  it("does not invent rpm or grind when the official recipe omits them", () => {
    const official = brewSnapshotFromPlaceholder(
      hotRecipe({ grindSize: "", temperature: "" }),
    );
    official.rpm = null;
    official.grindSize = null;
    official.temperatureC = null;
    official.temperatureLabel = null;
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 18, brewRatio: 7.5 },
      copy,
    );
    expect(result.personalized.rpm).toBeNull();
    expect(result.personalized.grindSize).toBeNull();
    expect(result.personalized.temperatureC).toBeNull();
  });

  it("rejects NaN and Infinity inputs", () => {
    expect(
      validatePersonalizationInputs({ doseG: Number.NaN, ratio: 7.5, icedWaterPercentage: 50 }).ok,
    ).toBe(false);
    expect(
      validatePersonalizationInputs({
        doseG: 20,
        ratio: Number.POSITIVE_INFINITY,
        icedWaterPercentage: 50,
      }).ok,
    ).toBe(false);
  });

  it("never mutates the official pour array when scaling", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const before = official.pours.map((p) => p.waterAmountG);
    personalizeBrewSnapshot(official, { coffeeDoseG: 18, brewRatio: 7.5 }, copy);
    expect(official.pours.map((p) => p.waterAmountG)).toEqual(before);
  });
});

describe("personalized pour note rewriting", () => {
  const pour = (
    id: string,
    pourNumber: number,
    waterAmountG: number,
    notes: string,
  ): PersonalizedPour => ({
    id,
    pourNumber,
    waterAmountG,
    waterAmountLabel: `${waterAmountG} g`,
    timeLabel: "",
    notes,
    atSeconds: 0,
    durationSeconds: 30,
  });

  it("scales cumulative water notes that match structured pour totals", () => {
    const original = [
      pour("1", 1, 40, "Bloom gently."),
      pour("2", 2, 40, "Center pour in slow circles to 80 g total."),
      pour("3", 3, 40, "Continue to 120 g."),
      pour("4", 4, 30, "Pour until 150g"),
    ];
    const scaled = scalePoursProportionally(original, 150, 135);
    expect(scaled.map((p) => p.waterAmountG)).toEqual([36, 36, 36, 27]);
    expect(scaled[1]?.notes).toBe("Center pour in slow circles to 72 g total.");
    expect(scaled[2]?.notes).toBe("Continue to 108 g.");
    expect(scaled[3]?.notes).toBe("Pour until 135g");
    expect(scaled[0]?.notes).toBe("Bloom gently.");
  });

  it("leaves no-pours recipes unchanged", () => {
    const official = brewSnapshotFromPlaceholder(
      hotRecipe({
        steps: [],
        dose: "15 g",
        waterAmount: "225 g",
        ratio: "1:15",
      }),
    );
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 18, brewRatio: 15 },
      copy,
    );
    expect(result.personalized.pours).toEqual([]);
    expect(result.official.pours).toEqual([]);
  });

  it("leaves notes with no numeric brew value unchanged", () => {
    expect(
      rewriteBrewNoteGrams("Swirl once to degas.", new Map([[40, 36], [150, 135]])),
    ).toBe("Swirl once to degas.");
    expect(
      rewriteBrewNoteGrams("Wait 45 seconds before the next pour.", new Map([[45, 40]])),
    ).toBe("Wait 45 seconds before the next pour.");
  });

  it("keeps official recipe notes immutable after personalization", () => {
    const official = brewSnapshotFromPlaceholder(
      hotRecipe({
        steps: [
          {
            id: "s1",
            pourNumber: 1,
            waterAmount: "40 g",
            timeLabel: "0:00–0:30",
            notes: "Bloom to 40 g.",
            atSeconds: 0,
            durationSeconds: 30,
          },
          {
            id: "s2",
            pourNumber: 2,
            waterAmount: "110 g",
            timeLabel: "0:30–1:30",
            notes: "Pour until 150g",
            atSeconds: 30,
            durationSeconds: 60,
          },
        ],
        waterAmount: "150 g",
        dose: "20 g",
        ratio: "1:7.5",
      }),
    );
    const originalNotes = official.pours.map((p) => p.notes);
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 18, brewRatio: 7.5 },
      copy,
    );
    expect(official.pours.map((p) => p.notes)).toEqual(originalNotes);
    expect(result.official.pours.map((p) => p.notes)).toEqual(originalNotes);
    expect(result.personalized.pours[1]?.notes).toBe("Pour until 135g");
    expect(result.personalized.pours[0]?.notes).toBe("Bloom to 36 g.");
  });
});

describe("share URL param validation", () => {
  it("accepts only validated dose/ratio/style values", async () => {
    const { adjustmentsFromSearchParams } = await import(
      "@/lib/recipes/personalization/personal-recipe-storage"
    );
    const params = new URLSearchParams(
      "dose=-5&ratio=abc&style=cold&method=v60&dose=18&ratio=7.5&style=iced",
    );
    // URLSearchParams keeps last value for duplicate keys in get()
    const parsed = adjustmentsFromSearchParams(
      new URLSearchParams("dose=18&ratio=7.5&style=iced&method=v60"),
    );
    expect(parsed).toEqual({
      coffeeDoseG: 18,
      brewRatio: 7.5,
      servingStyle: "iced",
      brewMethod: "v60",
    });
    const invalid = adjustmentsFromSearchParams(
      new URLSearchParams("dose=-5&ratio=abc&style=cold&method=nope"),
    );
    expect(invalid).toEqual({});
    void params;
  });
});
