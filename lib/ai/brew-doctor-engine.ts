import type { BrewDoctorInput, BrewDoctorRecommendation, BrewDoctorResult, BrewDoctorSymptom } from "@/types/ai-coach-module";

const SYMPTOM_RECOMMENDATIONS: Record<BrewDoctorSymptom, BrewDoctorRecommendation[]> = {
  sour: [
    { category: "grind", action: "Grind 1–2 steps finer", why: "Sourness often signals under-extraction — finer particles increase surface area and extraction rate." },
    { category: "temperature", action: "Raise water temperature by 1–2°C (within roast-appropriate range)", why: "Cooler water extracts acids faster than sugars, leaving the cup tasting sharp and sour." },
    { category: "time", action: "Extend total brew time slightly", why: "More contact time allows sugars and body compounds to dissolve, balancing acidity." },
  ],
  bitter: [
    { category: "grind", action: "Grind 1–2 steps coarser", why: "Bitterness typically indicates over-extraction — coarser particles slow extraction." },
    { category: "temperature", action: "Lower water temperature by 1–2°C", why: "Hot water extracts bitter compounds (polyphenols, dry distillates) more aggressively." },
    { category: "pour", action: "Reduce agitation and pour intensity", why: "Turbulent pours increase extraction unevenness and can push past the sweet spot." },
  ],
  weak: [
    { category: "ratio", action: "Use a tighter ratio (more coffee, same water) or increase dose", why: "Weak coffee usually means too little dissolved solids relative to water volume." },
    { category: "grind", action: "Grind slightly finer", why: "Finer grind increases extraction yield, adding body and flavor intensity." },
    { category: "water", action: "Verify dose and yield measurements", why: "Inaccurate scales are a common cause of unexpectedly weak cups." },
  ],
  strong: [
    { category: "ratio", action: "Use a wider ratio (less coffee, same water)", why: "Strong cups often result from too much coffee relative to water." },
    { category: "grind", action: "Grind slightly coarser", why: "Coarser grind reduces extraction rate, softening intensity." },
    { category: "water", action: "Add a small bypass (hot water after brewing) if appropriate for your method", why: "Bypass dilutes strength while preserving extracted flavor profile." },
  ],
  dry: [
    { category: "grind", action: "Grind slightly finer and ensure even saturation", why: "Dry, papery notes often come from under-extraction of the coffee bed." },
    { category: "bloom", action: "Extend bloom time and ensure all grounds are wet", why: "Dry pockets in the bed extract unevenly, producing astringent dryness." },
    { category: "pour", action: "Pour more gently with even coverage", why: "Channeling leaves some grounds under-extracted while others over-extract." },
  ],
  astringent: [
    { category: "grind", action: "Grind coarser and reduce fines", why: "Astringency (drying, puckering) is a hallmark of over-extraction, especially of fines." },
    { category: "pour", action: "Reduce pour agitation", why: "Aggressive pouring increases fines migration and over-extraction at the filter." },
    { category: "time", action: "Shorten total brew time", why: "Long contact times pull harsh polyphenols into the cup." },
  ],
  hollow: [
    { category: "ratio", action: "Tighten ratio or increase dose", why: "Hollow cups lack dissolved solids — the structure feels thin despite flavor notes." },
    { category: "grind", action: "Grind finer to increase extraction", why: "Under-extraction produces flavor without body or sweetness." },
    { category: "temperature", action: "Ensure water is hot enough for your roast level", why: "Light roasts especially need adequate temperature to extract body compounds." },
  ],
  salty: [
    { category: "water", action: "Check water quality — high sodium or mineral imbalance can taste salty", why: "Water chemistry directly affects flavor perception." },
    { category: "grind", action: "Grind finer to improve extraction balance", why: "Under-extracted cups can taste oddly saline when acids dominate." },
    { category: "ratio", action: "Verify dose accuracy", why: "Too little coffee with normal water can produce an unbalanced, saline impression." },
  ],
  fastDrawdown: [
    { category: "grind", action: "Grind finer", why: "Fast drawdowns often mean the bed is too coarse or channeling is occurring." },
    { category: "pour", action: "Pour more slowly and evenly", why: "Channeling creates paths of least resistance, draining too quickly." },
    { category: "bloom", action: "Ensure proper bloom — degassing opens the bed for even flow", why: "Fresh coffee that hasn't bloomed can choke or channel unpredictably." },
  ],
  slowDrawdown: [
    { category: "grind", action: "Grind coarser", why: "Slow drawdowns usually indicate too many fines or an overly fine grind clogging the filter." },
    { category: "pour", action: "Avoid disturbing the bed excessively", why: "Agitation releases fines that clog paper filters." },
    { category: "filter", action: "Check filter type and rinse thoroughly", why: "Some filters and insufficient rinsing affect flow rate." },
  ],
  overExtraction: [
    { category: "grind", action: "Grind coarser", why: "Over-extraction means too many compounds were dissolved — coarser grind is the primary lever." },
    { category: "temperature", action: "Lower temperature", why: "Excessive heat accelerates extraction of bitter and astringent compounds." },
    { category: "time", action: "Reduce total contact time", why: "Longer brewing continues extracting past the sweet spot." },
  ],
  underExtraction: [
    { category: "grind", action: "Grind finer", why: "Under-extraction means not enough flavor was dissolved — finer grind is the primary lever." },
    { category: "temperature", action: "Raise temperature within roast-appropriate range", why: "Insufficient heat limits extraction, especially for light roasts." },
    { category: "time", action: "Extend brew time or use more pours", why: "More contact time allows fuller extraction of sugars and acids." },
  ],
};

const SYMPTOM_SUMMARIES: Record<BrewDoctorSymptom, string> = {
  sour: "Your cup is likely **under-extracted**. Sour, sharp, or vinegar-like flavors mean the water hasn't dissolved enough of the coffee's sugars and body compounds yet.",
  bitter: "Your cup is likely **over-extracted**. Bitter, harsh, or ashy flavors mean too many compounds — including undesirable ones — were pulled from the grounds.",
  weak: "Your coffee tastes **thin or watery**, which usually points to too low a brew strength — not enough dissolved coffee solids in the cup.",
  strong: "Your coffee is **intense or overpowering**, typically from too high a brew strength or over-concentration.",
  dry: "A **dry, papery finish** often signals uneven extraction or under-extracted portions of the coffee bed.",
  astringent: "That **drying, puckering sensation** is a classic over-extraction signal — especially from fines or excessive contact time.",
  hollow: "A **hollow cup** has flavor notes but lacks body and sweetness — usually under-extraction or too wide a ratio.",
  salty: "A **salty impression** can come from water chemistry, under-extraction, or an imbalanced ratio.",
  fastDrawdown: "A **fast drawdown** suggests the bed isn't offering enough resistance — coarse grind, channeling, or insufficient bloom.",
  slowDrawdown: "A **slow or stalling drawdown** usually means too many fines, too fine a grind, or a clogged filter.",
  overExtraction: "Signs point to **over-extraction** — too many compounds dissolved, pushing past the sweet spot into bitterness.",
  underExtraction: "Signs point to **under-extraction** — not enough flavor dissolved, leaving the cup sour, thin, or lacking sweetness.",
};

function computeConfidence(input: BrewDoctorInput): "low" | "medium" | "high" {
  let provided = 1;
  let total = 4;
  if (input.method) provided++;
  if (input.doseG) provided++;
  if (input.grindSize) provided++;
  if (input.temperatureC) provided++;
  if (input.brewTime) provided++;
  total = 6;
  const ratio = provided / total;
  if (ratio >= 0.7) return "high";
  if (ratio >= 0.4) return "medium";
  return "low";
}

/** Deterministic Brew Doctor — diagnoses symptoms and recommends adjustments with explanations. */
export function diagnoseBrew(input: BrewDoctorInput): BrewDoctorResult {
  const recommendations = [...SYMPTOM_RECOMMENDATIONS[input.symptom]];

  if (input.method?.toLowerCase().includes("espresso") && input.symptom === "sour") {
    recommendations.unshift({
      category: "ratio",
      action: "Try a slightly longer yield (more water through the same dose)",
      why: "Espresso sourness often improves with a longer ratio before changing grind.",
    });
  }

  return {
    symptom: input.symptom,
    summary: SYMPTOM_SUMMARIES[input.symptom],
    recommendations,
    confidence: computeConfidence(input),
  };
}

export function formatBrewDoctorResponse(result: BrewDoctorResult): string {
  const lines = [
    result.summary,
    "",
    "## Recommendations",
    "",
    ...result.recommendations.map(
      (rec, i) => `${i + 1}. **${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}:** ${rec.action}\n   *Why:* ${rec.why}`,
    ),
    "",
    `_Confidence: ${result.confidence}_`,
  ];
  return lines.join("\n");
}
