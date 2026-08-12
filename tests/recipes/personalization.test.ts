import { describe, expect, it } from "vitest";
import {
  brewSnapshotFromPlaceholder,
  buildPoursForCount,
  calculateTasteDirection,
  calculateTotalWaterG,
  DEFAULT_PERSONALIZATION_CONFIG,
  distributeBrewWater,
  personalizeBrewSnapshot,
  rewriteBrewNoteGrams,
  roundBrewValue,
  scalePoursProportionally,
  splitHotAndIce,
  temperatureBoundsForRecipe,
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
      new URLSearchParams("dose=18&ratio=7.5&style=iced&method=v60&temp=94&pours=3&grind=-1"),
    );
    expect(parsed).toEqual({
      coffeeDoseG: 18,
      brewRatio: 7.5,
      servingStyle: "iced",
      brewMethod: "v60",
      brewTemperatureC: 94,
      pourCount: 3,
      grindOffset: -1,
    });
    const invalid = adjustmentsFromSearchParams(
      new URLSearchParams("dose=-5&ratio=abc&style=cold&method=nope&temp=0&pours=9&grind=5"),
    );
    expect(invalid).toEqual({});
    void params;
  });
});

describe("variable pour redistribution", () => {
  it("distributes 1–5 pours while conserving total water", () => {
    for (const count of [1, 2, 3, 4, 5]) {
      const amounts = distributeBrewWater(150, count);
      expect(amounts).toHaveLength(count);
      expect(roundBrewValue(amounts.reduce((sum, value) => sum + value, 0))).toBe(150);
    }
  });

  it("uses even splits for 3 pours and last-pour rounding for odd totals", () => {
    expect(distributeBrewWater(150, 3)).toEqual([50, 50, 50]);
    expect(distributeBrewWater(112.5, 4)).toEqual([28.1, 28.1, 28.1, 28.2]);
  });

  it("preserves bloom concept when bloom amount is provided", () => {
    expect(distributeBrewWater(150, 4, { bloomAmountG: 40 })).toEqual([40, 36.7, 36.7, 36.6]);
  });

  it("rebuilds pour count without mutating the official snapshot", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const before = official.pours.map((pour) => ({ ...pour }));
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 20, brewRatio: 7.5, pourCount: 3 },
      copy,
    );
    expect(result.isPersonalized).toBe(true);
    expect(result.personalized.pours.map((pour) => pour.waterAmountG)).toEqual([40, 55, 55]);
    expect(official.pours).toEqual(before);
    expect(result.official.pours).toEqual(before);
  });

  it("generates derived pours for no-pours recipes when pourCount is set", () => {
    const official = brewSnapshotFromPlaceholder(
      hotRecipe({ steps: [], dose: "20 g", waterAmount: "150 g", ratio: "1:7.5", bloom: "—" }),
    );
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 20, brewRatio: 7.5, pourCount: 3 },
      copy,
    );
    expect(result.personalized.pours).toHaveLength(3);
    expect(
      roundBrewValue(
        result.personalized.pours.reduce((sum, pour) => sum + (pour.waterAmountG ?? 0), 0),
      ),
    ).toBe(150);
    expect(result.official.pours).toEqual([]);
  });

  it("keeps empty pours when no-pours recipe only changes dose", () => {
    const official = brewSnapshotFromPlaceholder(
      hotRecipe({ steps: [], dose: "15 g", waterAmount: "225 g", ratio: "1:15" }),
    );
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 18, brewRatio: 15 },
      copy,
    );
    expect(result.personalized.pours).toEqual([]);
  });

  it("buildPoursForCount creates unique pour ids without duplicates", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe({ steps: [] }));
    const pours = buildPoursForCount(150, 5, official);
    const ids = pours.map((pour) => pour.id);
    expect(new Set(ids).size).toBe(5);
  });
});

describe("temperature and grind personalization", () => {
  it("applies temperature within method-aware bounds", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const bounds = temperatureBoundsForRecipe(official, "v60");
    expect(bounds).not.toBeNull();
    expect(bounds!.min).toBeLessThan(bounds!.officialC);
    expect(bounds!.max).toBeGreaterThan(bounds!.officialC);

    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 20, brewRatio: 7.5, brewTemperatureC: 95 },
      copy,
    );
    expect(result.isPersonalized).toBe(true);
    expect(result.personalized.temperatureC).toBe(95);
    expect(result.official.temperatureC).toBe(93);
  });

  it("does not mark matching official temperature as personalized alone", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 20, brewRatio: 7.5, brewTemperatureC: 93 },
      copy,
    );
    expect(result.isPersonalized).toBe(false);
  });

  it("applies relative grind offsets without inventing absolute settings", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const finer = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 20, brewRatio: 7.5, grindOffset: -1 },
      copy,
    );
    expect(finer.personalized.grindSize).toContain("finer");
    expect(finer.official.grindSize).toBe("Medium");
  });

  it("returns null temperature bounds when official temp is missing", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe({ temperature: "—" }));
    official.temperatureC = null;
    expect(temperatureBoundsForRecipe(official)).toBeNull();
  });
});

describe("taste direction guidance", () => {
  it("shifts extraction/body up when temperature rises", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 20, brewRatio: 7.5, brewTemperatureC: 97 },
      copy,
    );
    const taste = calculateTasteDirection(official, result.personalized, result.adjustments);
    const extraction = taste.metrics.find((metric) => metric.key === "extraction")!;
    const body = taste.metrics.find((metric) => metric.key === "body")!;
    expect(extraction.delta).toBeGreaterThan(0);
    expect(body.delta).toBeGreaterThan(0);
    expect(taste.summary.toLowerCase()).toMatch(/fuller|extracted|bitterness|balanced/);
    expect(taste.bullets.some((bullet) => /may increase extraction/i.test(bullet.text))).toBe(true);
  });

  it("accounts for iced dilution and more pours", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { servingStyle: "iced", coffeeDoseG: 20, brewRatio: 7.5, pourCount: 5 },
      copy,
      DEFAULT_PERSONALIZATION_CONFIG,
    );
    const taste = calculateTasteDirection(official, result.personalized, {
      ...result.adjustments,
      pourCount: 5,
    });
    expect(taste.bullets.some((bullet) => /dilution/i.test(bullet.text))).toBe(true);
    expect(taste.bullets.some((bullet) => /agitation/i.test(bullet.text))).toBe(true);
  });

  it("reacts to ratio, dose, and grind changes", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const result = personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 22, brewRatio: 9, grindOffset: -2 },
      copy,
    );
    const taste = calculateTasteDirection(official, result.personalized, result.adjustments);
    expect(taste.bullets.some((bullet) => /ratio/i.test(bullet.text))).toBe(true);
    expect(taste.bullets.some((bullet) => /dose/i.test(bullet.text))).toBe(true);
    expect(taste.bullets.some((bullet) => /finer grind/i.test(bullet.text))).toBe(true);
  });
});

describe("reset and immutability across new knobs", () => {
  it("reset-equivalent adjustments restore the official snapshot", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const personalized = personalizeBrewSnapshot(
      official,
      {
        coffeeDoseG: 18,
        brewRatio: 8,
        pourCount: 2,
        brewTemperatureC: 96,
        grindOffset: 1,
        servingStyle: "iced",
      },
      copy,
    );
    expect(personalized.isPersonalized).toBe(true);

    const reset = personalizeBrewSnapshot(
      official,
      {
        coffeeDoseG: 20,
        brewRatio: 7.5,
        pourCount: 4,
        brewTemperatureC: 93,
        grindOffset: 0,
        servingStyle: "hot",
      },
      copy,
    );
    expect(reset.isPersonalized).toBe(false);
    expect(reset.personalized.hotWaterG).toBe(official.hotWaterG);
    expect(reset.personalized.pours.map((pour) => pour.waterAmountG)).toEqual(
      official.pours.map((pour) => pour.waterAmountG),
    );
  });

  it("never mutates official temperature or pour fields", () => {
    const official = brewSnapshotFromPlaceholder(hotRecipe());
    const tempBefore = official.temperatureC;
    const poursBefore = official.pours.map((pour) => pour.waterAmountG);
    personalizeBrewSnapshot(
      official,
      { coffeeDoseG: 18, brewRatio: 7.5, pourCount: 5, brewTemperatureC: 90 },
      copy,
    );
    expect(official.temperatureC).toBe(tempBefore);
    expect(official.pours.map((pour) => pour.waterAmountG)).toEqual(poursBefore);
  });
});
