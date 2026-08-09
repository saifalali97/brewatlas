import type {
  PlaceholderFlavorProfile,
  PlaceholderRecipeStep,
} from "@/lib/gulf-directory/placeholder-recipe-types";

export type BrewMethodKey =
  | "v60-hot"
  | "v60-iced"
  | "origami-hot"
  | "origami-iced"
  | "kalita"
  | "chemex"
  | "aeropress"
  | "french-press"
  | "espresso"
  | "cold-brew";

export type MethodTemplate = {
  brewMethod: string;
  isIced: boolean;
  image: string;
  brewer: string;
  filter: string;
  dose: string;
  waterAmount: string;
  temperature: string;
  ratio: string;
  grindSize: string;
  bloom: string;
  brewTime: string;
  totalBrewTime: string;
  grinder: string;
  water: string;
  steps: PlaceholderRecipeStep[];
  equipment: Array<{ name: string; detail: string }>;
  defaultFlavor: PlaceholderFlavorProfile;
};

function steps(
  items: Array<Omit<PlaceholderRecipeStep, "id"> & { id?: string }>,
  prefix: string,
): PlaceholderRecipeStep[] {
  return items.map((item, index) => ({
    ...item,
    id: item.id ?? `${prefix}-${index + 1}`,
  }));
}

/** Brew-method templates for the Gulf recipe seed library. */
export const GULF_METHOD_TEMPLATES: Record<BrewMethodKey, MethodTemplate> = {
  "v60-hot": {
    brewMethod: "V60",
    isIced: false,
    image: "/images/methods/pour-over.webp",
    brewer: "Hario V60 02",
    filter: "V60 paper (rinsed)",
    dose: "15 g",
    waterAmount: "250 g",
    temperature: "93°C",
    ratio: "1:16.7",
    grindSize: "Medium-fine",
    bloom: "45 g / 0:45",
    brewTime: "3:00",
    totalBrewTime: "2:45–3:15",
    grinder: "Burr grinder",
    water: "Soft mineral / Third Wave Water",
    defaultFlavor: { sweetness: 76, acidity: 82, body: 54, bitterness: 24, finish: 72 },
    equipment: [
      { name: "Hario V60 02", detail: "Cone pour-over" },
      { name: "Gooseneck kettle", detail: "Precise pour control" },
      { name: "Scale", detail: "0.1 g accuracy" },
      { name: "Burr grinder", detail: "Medium-fine" },
      { name: "V60 filters", detail: "Rinse before brew" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "45 g", timeLabel: "0:00–0:45", notes: "Bloom gently and swirl once to degas.", atSeconds: 0, durationSeconds: 45 },
        { pourNumber: 2, waterAmount: "100 g", timeLabel: "0:45–1:20", notes: "Center pour in slow circles to 145 g total.", atSeconds: 45, durationSeconds: 35 },
        { pourNumber: 3, waterAmount: "105 g", timeLabel: "1:20–2:00", notes: "Continue to 250 g, keeping the bed flat.", atSeconds: 80, durationSeconds: 40 },
        { pourNumber: 4, waterAmount: "Drawdown", timeLabel: "2:00–3:00", notes: "Finish with a gentle swirl; target drawdown by 3:00.", atSeconds: 120, durationSeconds: 60 },
      ],
      "v60h",
    ),
  },
  "v60-iced": {
    brewMethod: "V60",
    isIced: true,
    image: "/images/methods/pour-over.webp",
    brewer: "Hario V60 02",
    filter: "V60 paper (rinsed)",
    dose: "20 g",
    waterAmount: "200 g hot + 120 g ice",
    temperature: "94°C → ice",
    ratio: "1:16 beverage",
    grindSize: "Medium-fine (slightly finer)",
    bloom: "40 g / 0:30",
    brewTime: "2:30",
    totalBrewTime: "2:15–2:45",
    grinder: "Burr grinder",
    water: "Hot brew water over fresh ice",
    defaultFlavor: { sweetness: 80, acidity: 78, body: 48, bitterness: 20, finish: 70 },
    equipment: [
      { name: "Hario V60 02", detail: "Flash brew over ice" },
      { name: "Ice", detail: "120 g in the server" },
      { name: "Gooseneck kettle", detail: "Hot water control" },
      { name: "Scale", detail: "Track hot water only" },
      { name: "V60 filters", detail: "Rinse before brew" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "Prep", timeLabel: "Prep", notes: "Add 120 g ice to the server. Rinse filter.", atSeconds: 0, durationSeconds: 20 },
        { pourNumber: 2, waterAmount: "40 g", timeLabel: "0:00–0:30", notes: "Bloom on the ice-catching bed.", atSeconds: 20, durationSeconds: 30 },
        { pourNumber: 3, waterAmount: "160 g", timeLabel: "0:30–1:40", notes: "Pulse pour to 200 g hot water total.", atSeconds: 50, durationSeconds: 70 },
        { pourNumber: 4, waterAmount: "Swirl", timeLabel: "1:40–2:30", notes: "Swirl server to melt ice evenly and chill the cup.", atSeconds: 120, durationSeconds: 50 },
      ],
      "v60i",
    ),
  },
  "origami-hot": {
    brewMethod: "Origami",
    isIced: false,
    image: "/images/recipes/origami-dripper.webp",
    brewer: "Origami Dripper M",
    filter: "Origami / conical paper",
    dose: "16 g",
    waterAmount: "260 g",
    temperature: "92°C",
    ratio: "1:16.25",
    grindSize: "Medium",
    bloom: "50 g / 0:40",
    brewTime: "3:10",
    totalBrewTime: "2:50–3:20",
    grinder: "Burr grinder",
    water: "Balanced mineral water",
    defaultFlavor: { sweetness: 74, acidity: 70, body: 62, bitterness: 26, finish: 68 },
    equipment: [
      { name: "Origami Dripper", detail: "Wave or conical filter" },
      { name: "Gooseneck kettle", detail: "Controlled pours" },
      { name: "Scale", detail: "0.1 g accuracy" },
      { name: "Burr grinder", detail: "Medium setting" },
      { name: "Server", detail: "Heat-safe glass" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "50 g", timeLabel: "0:00–0:40", notes: "Bloom and gentle swirl to wet all grounds.", atSeconds: 0, durationSeconds: 40 },
        { pourNumber: 2, waterAmount: "110 g", timeLabel: "0:40–1:30", notes: "Pulse pour to 160 g, keeping slurry lively.", atSeconds: 40, durationSeconds: 50 },
        { pourNumber: 3, waterAmount: "100 g", timeLabel: "1:30–2:20", notes: "Finish to 260 g with a calm center pour.", atSeconds: 90, durationSeconds: 50 },
        { pourNumber: 4, waterAmount: "Drawdown", timeLabel: "2:20–3:10", notes: "Allow a clean drawdown; avoid stirring the bed.", atSeconds: 140, durationSeconds: 50 },
      ],
      "orih",
    ),
  },
  "origami-iced": {
    brewMethod: "Origami",
    isIced: true,
    image: "/images/recipes/origami-dripper.webp",
    brewer: "Origami Dripper M",
    filter: "Origami / conical paper",
    dose: "18 g",
    waterAmount: "180 g hot + 100 g ice",
    temperature: "93°C → ice",
    ratio: "1:15.5 beverage",
    grindSize: "Medium-fine",
    bloom: "40 g / 0:35",
    brewTime: "2:40",
    totalBrewTime: "2:20–2:50",
    grinder: "Burr grinder",
    water: "Hot water over ice",
    defaultFlavor: { sweetness: 78, acidity: 74, body: 50, bitterness: 22, finish: 66 },
    equipment: [
      { name: "Origami Dripper", detail: "Iced flash brew" },
      { name: "Ice", detail: "100 g in server" },
      { name: "Gooseneck kettle", detail: "Hot water" },
      { name: "Scale", detail: "Track hot water" },
      { name: "Filters", detail: "Rinse lightly" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "Prep", timeLabel: "Prep", notes: "Place 100 g ice in the server under the dripper.", atSeconds: 0, durationSeconds: 15 },
        { pourNumber: 2, waterAmount: "40 g", timeLabel: "0:00–0:35", notes: "Bloom thoroughly.", atSeconds: 15, durationSeconds: 35 },
        { pourNumber: 3, waterAmount: "140 g", timeLabel: "0:35–1:50", notes: "Pulse to 180 g hot water.", atSeconds: 50, durationSeconds: 75 },
        { pourNumber: 4, waterAmount: "Finish", timeLabel: "1:50–2:40", notes: "Swirl to chill and integrate meltwater.", atSeconds: 125, durationSeconds: 50 },
      ],
      "orii",
    ),
  },
  kalita: {
    brewMethod: "Kalita Wave",
    isIced: false,
    image: "/images/methods/pour-over.webp",
    brewer: "Kalita Wave 185",
    filter: "Kalita Wave paper",
    dose: "20 g",
    waterAmount: "320 g",
    temperature: "92°C",
    ratio: "1:16",
    grindSize: "Medium",
    bloom: "60 g / 0:45",
    brewTime: "3:20",
    totalBrewTime: "3:00–3:40",
    grinder: "Burr grinder",
    water: "Balanced mineral water",
    defaultFlavor: { sweetness: 72, acidity: 64, body: 70, bitterness: 28, finish: 68 },
    equipment: [
      { name: "Kalita Wave 185", detail: "Flat-bottom dripper" },
      { name: "Wave filters", detail: "Rinse before brew" },
      { name: "Gooseneck kettle", detail: "Even saturation" },
      { name: "Scale", detail: "0.1 g accuracy" },
      { name: "Burr grinder", detail: "Medium setting" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "60 g", timeLabel: "0:00–0:45", notes: "Bloom across the flat bed; swirl once.", atSeconds: 0, durationSeconds: 45 },
        { pourNumber: 2, waterAmount: "130 g", timeLabel: "0:45–1:40", notes: "Pour in pulses to 190 g total.", atSeconds: 45, durationSeconds: 55 },
        { pourNumber: 3, waterAmount: "130 g", timeLabel: "1:40–2:30", notes: "Finish to 320 g with a calm spiral.", atSeconds: 100, durationSeconds: 50 },
        { pourNumber: 4, waterAmount: "Drawdown", timeLabel: "2:30–3:20", notes: "Let the Wave drain cleanly without stirring.", atSeconds: 150, durationSeconds: 50 },
      ],
      "kal",
    ),
  },
  chemex: {
    brewMethod: "Chemex",
    isIced: false,
    image: "/images/recipes/chemex.webp",
    brewer: "Chemex 6-cup",
    filter: "Chemex bonded filter",
    dose: "30 g",
    waterAmount: "500 g",
    temperature: "94°C",
    ratio: "1:16.7",
    grindSize: "Medium-coarse",
    bloom: "60 g / 0:45",
    brewTime: "4:30",
    totalBrewTime: "4:00–5:00",
    grinder: "Burr grinder",
    water: "Soft mineral water",
    defaultFlavor: { sweetness: 74, acidity: 68, body: 58, bitterness: 22, finish: 76 },
    equipment: [
      { name: "Chemex 6-cup", detail: "Hourglass brewer" },
      { name: "Chemex filters", detail: "Thick bonded paper" },
      { name: "Gooseneck kettle", detail: "Slow pulses" },
      { name: "Scale", detail: "Larger batch tracking" },
      { name: "Burr grinder", detail: "Medium-coarse" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "60 g", timeLabel: "0:00–0:45", notes: "Bloom and swirl; ensure full saturation.", atSeconds: 0, durationSeconds: 45 },
        { pourNumber: 2, waterAmount: "200 g", timeLabel: "0:45–2:00", notes: "Pulse pour to 260 g total.", atSeconds: 45, durationSeconds: 75 },
        { pourNumber: 3, waterAmount: "240 g", timeLabel: "2:00–3:30", notes: "Continue to 500 g in calm pulses.", atSeconds: 120, durationSeconds: 90 },
        { pourNumber: 4, waterAmount: "Drawdown", timeLabel: "3:30–4:30", notes: "Let the bed drain; avoid pressing the filter.", atSeconds: 210, durationSeconds: 60 },
      ],
      "chem",
    ),
  },
  aeropress: {
    brewMethod: "Aeropress",
    isIced: false,
    image: "/images/recipes/costa-rica-aeropress.webp",
    brewer: "Aeropress",
    filter: "Paper filter (rinsed)",
    dose: "16 g",
    waterAmount: "230 g",
    temperature: "88°C",
    ratio: "1:14.4",
    grindSize: "Medium-fine",
    bloom: "N/A (immersion)",
    brewTime: "2:00",
    totalBrewTime: "1:45–2:15",
    grinder: "Burr grinder",
    water: "Soft mineral water",
    defaultFlavor: { sweetness: 70, acidity: 60, body: 72, bitterness: 30, finish: 64 },
    equipment: [
      { name: "Aeropress", detail: "Standard or inverted" },
      { name: "Paper filters", detail: "Rinse to remove paper taste" },
      { name: "Stirrer", detail: "Even saturation" },
      { name: "Scale", detail: "Dose + water" },
      { name: "Timer", detail: "Steep control" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "16 g coffee", timeLabel: "Prep", notes: "Add coffee to the chamber (standard method).", atSeconds: 0, durationSeconds: 20 },
        { pourNumber: 2, waterAmount: "230 g", timeLabel: "0:00", notes: "Pour all water, stir 5 seconds.", atSeconds: 20, durationSeconds: 15 },
        { pourNumber: 3, waterAmount: "Steep", timeLabel: "0:15–1:30", notes: "Steep with gentle pressure on the plunger seal.", atSeconds: 35, durationSeconds: 75 },
        { pourNumber: 4, waterAmount: "Press", timeLabel: "1:30–2:00", notes: "Press steadily for 30 seconds to a full stop.", atSeconds: 110, durationSeconds: 30 },
      ],
      "aero",
    ),
  },
  "french-press": {
    brewMethod: "French Press",
    isIced: false,
    image: "/images/methods/french-press.webp",
    brewer: "French press",
    filter: "Metal mesh plunger",
    dose: "30 g",
    waterAmount: "500 g",
    temperature: "93°C",
    ratio: "1:16.7",
    grindSize: "Coarse",
    bloom: "60 g / 0:30",
    brewTime: "4:00",
    totalBrewTime: "4:00–4:30",
    grinder: "Burr grinder",
    water: "Filtered mineral water",
    defaultFlavor: { sweetness: 68, acidity: 48, body: 82, bitterness: 32, finish: 60 },
    equipment: [
      { name: "French press", detail: "0.6–1 L press" },
      { name: "Burr grinder", detail: "Coarse setting" },
      { name: "Scale", detail: "Dose + water" },
      { name: "Timer", detail: "Steep control" },
      { name: "Spoon", detail: "Break crust" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "30 g coffee", timeLabel: "Prep", notes: "Preheat the press and add coarse grounds.", atSeconds: 0, durationSeconds: 20 },
        { pourNumber: 2, waterAmount: "60 g", timeLabel: "0:00–0:30", notes: "Bloom, stir once to wet the bed.", atSeconds: 20, durationSeconds: 30 },
        { pourNumber: 3, waterAmount: "440 g", timeLabel: "0:30", notes: "Add remaining water to 500 g; lid on, plunger up.", atSeconds: 50, durationSeconds: 20 },
        { pourNumber: 4, waterAmount: "Steep", timeLabel: "0:50–4:00", notes: "Steep 3:30 more, break crust, skim foam, plunge slowly.", atSeconds: 70, durationSeconds: 190 },
      ],
      "fp",
    ),
  },
  espresso: {
    brewMethod: "Espresso",
    isIced: false,
    image: "/images/recipes/espresso-shot.webp",
    brewer: "Espresso machine",
    filter: "Precision basket",
    dose: "18 g",
    waterAmount: "36 g out",
    temperature: "93°C",
    ratio: "1:2",
    grindSize: "Fine (espresso)",
    bloom: "N/A",
    brewTime: "0:28",
    totalBrewTime: "25–30 sec",
    grinder: "Espresso burr grinder",
    water: "Balanced mineral (75–120 ppm)",
    defaultFlavor: { sweetness: 82, acidity: 55, body: 84, bitterness: 34, finish: 70 },
    equipment: [
      { name: "Espresso machine", detail: "Stable 9 bar" },
      { name: "Espresso grinder", detail: "Fine adjustment" },
      { name: "Precision basket", detail: "18–20 g" },
      { name: "Scale", detail: "Dose and yield" },
      { name: "Tamper", detail: "Level ~15 kg" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "Dose 18 g", timeLabel: "Prep", notes: "Distribute evenly and tamp level.", atSeconds: 0, durationSeconds: 25 },
        { pourNumber: 2, waterAmount: "Pre-infusion", timeLabel: "0:00–0:06", notes: "Low-pressure wet until first drops.", atSeconds: 25, durationSeconds: 6 },
        { pourNumber: 3, waterAmount: "36 g out", timeLabel: "0:06–0:28", notes: "Extract at 9 bar; stop at target yield.", atSeconds: 31, durationSeconds: 22 },
      ],
      "esp",
    ),
  },
  "cold-brew": {
    brewMethod: "Cold Brew",
    isIced: true,
    image: "/images/recipes/cold-brew.webp",
    brewer: "Immersion jar / Toddy",
    filter: "Paper or cloth cold-brew filter",
    dose: "100 g",
    waterAmount: "900 g",
    temperature: "Cold (fridge)",
    ratio: "1:9",
    grindSize: "Coarse",
    bloom: "N/A",
    brewTime: "14 hr",
    totalBrewTime: "12–16 hours",
    grinder: "Burr grinder",
    water: "Filtered cold water",
    defaultFlavor: { sweetness: 72, acidity: 28, body: 78, bitterness: 26, finish: 64 },
    equipment: [
      { name: "Immersion jar", detail: "1 L capacity" },
      { name: "Burr grinder", detail: "Coarse setting" },
      { name: "Filter", detail: "Paper or cloth" },
      { name: "Fridge", detail: "Overnight steep" },
      { name: "Bottle", detail: "Store concentrate" },
    ],
    steps: steps(
      [
        { pourNumber: 1, waterAmount: "100 g coffee", timeLabel: "Prep", notes: "Grind coarse into a clean vessel.", atSeconds: 0, durationSeconds: 45 },
        { pourNumber: 2, waterAmount: "900 g", timeLabel: "0:00", notes: "Add cold water and stir to wet fully.", atSeconds: 45, durationSeconds: 30 },
        { pourNumber: 3, waterAmount: "Steep", timeLabel: "0–14 hr", notes: "Cover and refrigerate 12–16 hours.", atSeconds: 75, durationSeconds: 240 },
        { pourNumber: 4, waterAmount: "Filter", timeLabel: "Finish", notes: "Filter and serve over ice or dilute 1:1.", atSeconds: 315, durationSeconds: 60 },
      ],
      "cb",
    ),
  },
};
