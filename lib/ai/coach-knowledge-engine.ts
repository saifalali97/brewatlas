import type { AiCoachMessage, AiCoachPreferences } from "@/types/ai-coach-module";
import { diagnoseBrew, formatBrewDoctorResponse } from "@/lib/ai/brew-doctor-engine";
import { formatRecipeResponse, generatePersonalizedRecipe } from "@/lib/ai/guided-brew-engine";
import { analyzeBrewSession, formatSessionAnalyzerResponse } from "@/lib/ai/session-analyzer-engine";
import type { BrewDoctorSymptom } from "@/types/ai-coach-module";

type KnowledgeEntry = { keywords: RegExp; answer: string };

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: /origin|ethiopia|kenya|colombia|brazil|panama|yemen|guatemala/i,
    answer: `## Coffee Origins

Origins shape flavor through **altitude, varietal, and processing**:

- **Ethiopia/Kenya:** Floral, citrus, bright acidity — often washed or natural
- **Colombia/Brazil:** Nutty, chocolate, caramel — versatile for espresso and filter
- **Panama:** Floral, tropical fruit, tea-like clarity — often high-elevation washed lots
- **Sumatra/Indonesia:** Herbal, earthy, full body — often wet-hulled

Higher altitude generally means slower cherry development and more complex acidity. I can't recommend specific competition recipes, but I can help you dial in any origin you're brewing.`,
  },
  {
    keywords: /process|washed|natural|honey|anaerobic|ferment/i,
    answer: `## Processing Methods

Processing affects how much fruit character reaches the cup:

| Method | Character | Extraction note |
| --- | --- | --- |
| **Washed** | Clean, bright, defined acidity | Forgiving; good for beginners |
| **Natural** | Fruity, winey, heavy body | Fines matter — avoid over-extraction |
| **Honey** | Sweet, syrupy, balanced | Mid-range grind often works well |
| **Anaerobic** | Intense, tropical, funky | Start conservative on ratio and temperature |

Processing changes density and solubility — adjust grind when switching between methods.`,
  },
  {
    keywords: /roast|light roast|dark roast|medium roast/i,
    answer: `## Roast Levels

Roast level determines solubility and optimal brew parameters:

- **Light:** Higher temperature (93–96°C), finer grind, longer contact time
- **Medium:** 90–94°C, medium-fine grind, standard ratios (1:15–1:17)
- **Dark:** Lower temperature (88–92°C), coarser grind to avoid bitterness

Dark roasts extract faster — if your light-roast recipe tastes bitter on a dark roast, grind coarser and lower temperature.`,
  },
  {
    keywords: /extract|extraction|solubles|tds|over.?extract|under.?extract/i,
    answer: `## Extraction

**Extraction** is how much flavor you dissolve from coffee into water.

- **Under-extracted:** Sour, sharp, salty, thin — grind finer, raise temp, extend time
- **Over-extracted:** Bitter, harsh, astringent, dry — grind coarser, lower temp, shorten time
- **Balanced:** Sweet, clean, structured acidity, pleasant finish

Think of it as a window: too little = sour, too much = bitter, the middle = sweet spot. Change **one variable at a time** when dialing in.`,
  },
  {
    keywords: /water|mineral|gh|kh|tds|calcium|magnesium|soft|hard/i,
    answer: `## Water Chemistry

Water is ~98% of your cup. Key concepts:

- **Total hardness (GH):** Calcium + magnesium — affects extraction power
- **Buffer (KH):** Bicarbonate — affects acidity perception
- **Target:** ~70–120 ppm TDS with balanced minerals for specialty coffee

Distilled or very soft water under-extracts. Very hard water can flatten acidity. If you can't measure, start with filtered tap water and focus on grind and ratio first — those matter more for most home brewers.`,
  },
  {
    keywords: /filter|paper|metal|cloth|v60|chemex|kalita/i,
    answer: `## Filters

Filter material affects body and clarity:

- **Paper (V60, Chemex):** Clean, bright cups; traps oils and fines
- **Metal (Able, some drip machines):** More body and oils; faster flow
- **Cloth (sock, flannel):** Rich body, some sediment; requires careful cleaning

Always **rinse paper filters** thoroughly to remove papery taste. Filter thickness affects flow rate — adjust grind accordingly.`,
  },
  {
    keywords: /grind|grinder|burr|blade|fines|uniformity|click/i,
    answer: `## Grinders

Grind quality is the single biggest upgrade for most brewers:

- **Burr grinders** produce uniform particles; blade grinders create unpredictable fines
- **Fines** over-extract quickly and cause bitterness — especially in pour-over
- **Adjust in small steps** — one click finer/coarser at a time

I can't recommend specific competition grinders, but look for **consistent particle size** in your budget. Match grind to brew method: espresso = fine, V60 = medium-fine, French press = coarse.`,
  },
  {
    keywords: /espresso|pressure|bar|puck|pre.?infusion|ristretto|lungo/i,
    answer: `## Espresso

Espresso is concentrated coffee brewed under pressure (~9 bar):

- **Typical ratio:** 1:2 (18g in → 36g out) — adjust to taste
- **Time:** 25–35 seconds for most setups
- **Grind:** Fine enough to reach pressure, coarse enough to avoid channeling

**Channeling** (water finding paths through the puck) causes uneven extraction. Distribute and tamp evenly. If sour: finer grind or longer ratio. If bitter: coarser or shorter ratio.`,
  },
  {
    keywords: /pour.?over|v60|kalita|bee house|manual/i,
    answer: `## Pour Over

Pour-over gives you direct control over extraction:

1. **Rinse filter** and preheat vessel
2. **Bloom** 30–45s with 2× dose weight of water
3. **Pour** in controlled spirals to target weight
4. **Drawdown** should be steady — not too fast, not stalling

V60 favors clarity; Kalita Wave favors even extraction with a flat bed. Start with 1:15–1:17 ratio and adjust from taste.`,
  },
  {
    keywords: /milk|latte|cappuccino|steam|microfoam|textur/i,
    answer: `## Milk & Espresso Drinks

Milk adds sweetness and body through lactose and fat:

- **Microfoam:** Tiny, uniform bubbles — silky texture for latte art
- **Cappuccino:** ~1:1:1 espresso, steamed milk, foam
- **Latte:** More steamed milk, thin foam layer

Steam until milk is **55–65°C** — hotter milk tastes flat. Good espresso + properly steamed milk = most of what you need for café-quality drinks at home.`,
  },
  {
    keywords: /bloom|degas|fresh|rest|off.?gas/i,
    answer: `## Bloom

**Bloom** is the initial pour that releases CO₂ from fresh coffee:

- Use **2× your dose weight** in water (e.g., 30g water for 15g coffee)
- Wait **30–45 seconds** — you'll see the bed swell and bubble
- CO₂ repels water; blooming ensures even saturation

Very fresh coffee (< 5 days off roast) needs longer bloom. Older coffee may need less. Skip bloom only for immersion methods where the full slurry steeps together.`,
  },
  {
    keywords: /bypass|dilut|concentrate|strength/i,
    answer: `## Bypass Brewing

**Bypass** means adding hot water *after* brewing to adjust strength without re-extracting:

- Brew a **concentrated** batch (tighter ratio)
- Add clean hot water to reach desired strength
- Preserves flavor profile while controlling TDS

Common in batch brewers and Japanese-style iced coffee. Useful when your coffee tastes good but too strong — bypass instead of grinding coarser.`,
  },
  {
    keywords: /temperature|temp|celsius|fahrenheit|°c|°f|hot/i,
    answer: `## Brew Temperature

Temperature affects which compounds extract first:

| Roast | Typical range |
| --- | --- |
| Light | 93–96°C |
| Medium | 90–94°C |
| Dark | 88–92°C |

Higher temp = faster extraction. If you're getting sourness on a light roast, try **95°C** before grinding finer. If bitterness on dark roast, try **90°C** before grinding coarser.

I can't give one universal temperature — it depends on your coffee, water, and grinder.`,
  },
  {
    keywords: /sour|acidity|acid|sharp|vinegar/i,
    answer: `## Why Is My Coffee Sour?

Sourness almost always means **under-extraction**. Try these in order:

1. **Grind finer** — most common fix
2. **Raise temperature** 1–2°C
3. **Extend brew time** or add a pour
4. **Check ratio** — too wide a ratio dilutes sweetness

Also verify your coffee isn't **very light roast + very coarse grind** — that combination is a common sour-cup culprit.`,
  },
  {
    keywords: /bitter|harsh|ashy|burnt/i,
    answer: `## Why Is My Coffee Bitter?

Bitterness usually means **over-extraction**. Try:

1. **Grind coarser** — most common fix
2. **Lower temperature** 1–2°C
3. **Shorten brew time** or reduce pours
4. **Reduce agitation** — less stirring and turbulence

Dark roasts extract faster — if you switched from light to dark without adjusting grind, that's likely the cause.`,
  },
  {
    keywords: /sweet|sweetness|sugar|caramel/i,
    answer: `## Improving Sweetness

Sweetness comes from **balanced extraction** — not adding sugar:

- Grind slightly **finer** until sourness disappears (but before bitterness)
- Use **fresh coffee** (2–4 weeks off roast for filter)
- Ensure **even saturation** — no dry pockets in the bed
- **Ratio 1:15–1:17** is a good starting window for pour-over

Sweetness is the reward for hitting the extraction sweet spot. If you're sour, you're not there yet. If bitter, you went past it.`,
  },
  {
    keywords: /v60|hario|best.*recipe/i,
    answer: `## V60 Starting Point

A reliable **starting recipe** (adjust to taste):

| Parameter | Value |
| --- | --- |
| Dose | 15g |
| Water | 250g (1:16.7) |
| Temperature | 93°C |
| Grind | Medium-fine |
| Bloom | 30s with 30g water |
| Total time | ~3:00 |

**Steps:** Rinse filter → Bloom → Pour to 120g by 1:00 → Pour to 250g by 1:45 → Drawdown ~3:00

This is a starting point, not a competition recipe. Adjust grind first based on taste.`,
  },
  {
    keywords: /espresso.*ratio|ratio.*espresso|18.*36|1:2/i,
    answer: `## Espresso Ratio

A common starting ratio is **1:2** by weight:

- **18g dose → 36g yield** in 25–35 seconds
- **1:1.5** (ristretto): sweeter, heavier body
- **1:2.5** (lungo): lighter, more diluted

Ratio controls strength; time and grind control extraction. If sour at 1:2, try finer grind before changing ratio. If bitter, coarser first.`,
  },
];

const FALLBACK_ANSWER = `I'm not certain about that specific question without more context. I'm best at **practical brewing guidance** — extraction, grind, ratio, temperature, and troubleshooting.

Try asking about:
- A taste problem (sour, bitter, weak)
- A brew method (V60, espresso, AeroPress)
- A concept (bloom, extraction, water)

If I don't know something, I'll say so rather than guess.`;

function matchKnowledge(question: string): string {
  const normalized = question.trim();
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.test(normalized)) return entry.answer;
  }
  return FALLBACK_ANSWER;
}

/** Coffee knowledge assistant — answers educational questions from a curated knowledge base. */
export function answerKnowledgeQuestion(question: string): string {
  return matchKnowledge(question);
}

function detectSymptom(text: string): BrewDoctorSymptom | null {
  const lower = text.toLowerCase();
  if (lower.includes("sour")) return "sour";
  if (lower.includes("bitter")) return "bitter";
  if (lower.includes("weak") || lower.includes("watery")) return "weak";
  if (lower.includes("strong") || lower.includes("too intense")) return "strong";
  if (lower.includes("dry")) return "dry";
  if (lower.includes("astringent") || lower.includes("puckering")) return "astringent";
  if (lower.includes("hollow")) return "hollow";
  if (lower.includes("salty")) return "salty";
  if (lower.includes("fast") && lower.includes("draw")) return "fastDrawdown";
  if (lower.includes("slow") && lower.includes("draw")) return "slowDrawdown";
  if (lower.includes("over-extract") || lower.includes("overextract")) return "overExtraction";
  if (lower.includes("under-extract") || lower.includes("underextract")) return "underExtraction";
  return null;
}

function personalizeAnswer(answer: string, prefs: AiCoachPreferences | null): string {
  if (!prefs) return answer;
  const hints: string[] = [];
  if (prefs.favoriteBrewer) hints.push(`Your usual brewer: **${prefs.favoriteBrewer}**`);
  if (prefs.favoriteRatio) hints.push(`Your preferred ratio: **${prefs.favoriteRatio}**`);
  if (hints.length === 0) return answer;
  return answer + "\n\n---\n\n_Personalized for you:_ " + hints.join(" · ");
}

/** Main chat engine — routes messages to knowledge, brew doctor, or general guidance. */
export function generateChatResponse(
  message: string,
  history: AiCoachMessage[],
  preferences: AiCoachPreferences | null,
): string {
  const trimmed = message.trim();
  if (!trimmed) return "Please enter a question or describe what you're brewing.";

  const symptom = detectSymptom(trimmed);
  if (symptom) {
    const result = diagnoseBrew({ symptom, notes: trimmed });
    return personalizeAnswer(formatBrewDoctorResponse(result), preferences);
  }

  if (/recipe|generate|suggest.*brew/i.test(trimmed)) {
    const method = preferences?.favoriteBrewer ?? "V60";
    const recipe = generatePersonalizedRecipe({ method, flavorPreference: trimmed });
    return personalizeAnswer(formatRecipeResponse(recipe), preferences);
  }

  if (/analyze|session|dose|yield|ratio/i.test(trimmed)) {
    const doseMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*g?\s*(?:dose|in)/i);
    const yieldMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*g?\s*(?:out|yield)/i);
    if (doseMatch) {
      const result = analyzeBrewSession({
        doseG: parseFloat(doseMatch[1]),
        yieldG: yieldMatch ? parseFloat(yieldMatch[1]) : null,
        flavorNotes: trimmed,
      });
      return personalizeAnswer(formatSessionAnalyzerResponse(result), preferences);
    }
  }

  const knowledgeAnswer = matchKnowledge(trimmed);
  if (knowledgeAnswer !== FALLBACK_ANSWER) {
    return personalizeAnswer(knowledgeAnswer, preferences);
  }

  if (history.length === 0) {
    return personalizeAnswer(
      `Welcome to **BrewAtlas AI Coach**. I'm here to help with brewing technique, extraction, troubleshooting, and recipes.\n\n${FALLBACK_ANSWER}`,
      preferences,
    );
  }

  return personalizeAnswer(FALLBACK_ANSWER, preferences);
}

export function generateConversationTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim().slice(0, 60);
  if (trimmed.length <= 40) return trimmed || "New conversation";
  return trimmed.slice(0, 40) + "…";
}
