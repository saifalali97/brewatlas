import type { DiscoveryFilters, DiscoveryVocabulary, SensoryDimension, SensoryIntent, SensoryVector } from "@/types/ai";
import type { LookupOption } from "@/types/recipe";

/**
 * The BrewAtlas Smart Recipe Discovery engine: a rule-based parser that
 * turns short, natural-language-ish queries ("I like fruity Ethiopian
 * coffees", "I want low acidity", "I only own xBloom Studio", "I have a
 * Fellow Ode grinder", "I prefer washed coffees", "I want sweet V60
 * recipes") into structured `DiscoveryFilters`, plus a matcher that
 * scores recipes against those filters.
 *
 * This is deliberately keyword/regex-based, not an LLM call (see
 * requirement: "Do NOT call external APIs yet"). `parseDiscoveryQuery`'s
 * signature -- a free-text string in, structured filters out -- is the
 * exact shape a future `getLLMAdapter().extractFilters(query)` call
 * could implement instead, without changing any caller.
 */

const ADJECTIVAL_ORIGIN_FORMS: Record<string, string> = {
  ethiopian: "ethiopia",
  colombian: "colombia",
  kenyan: "kenya",
  guatemalan: "guatemala",
  panamanian: "panama",
  indonesian: "indonesia",
  yemeni: "yemen",
  brazilian: "brazil",
  rwandan: "rwanda",
  "costa rican": "costa rica",
  salvadoran: "el salvador",
};

/** Fixed sensory-adjective vocabulary: phrase -> (dimension, intent). Checked as substrings, longest phrases first. */
const SENSORY_ADJECTIVES: { phrase: string; dimension: SensoryDimension; intent: SensoryIntent }[] = [
  { phrase: "low acidity", dimension: "acidity", intent: "low" },
  { phrase: "less acidic", dimension: "acidity", intent: "low" },
  { phrase: "not acidic", dimension: "acidity", intent: "low" },
  { phrase: "high acidity", dimension: "acidity", intent: "high" },
  { phrase: "bright", dimension: "acidity", intent: "high" },
  { phrase: "acidic", dimension: "acidity", intent: "high" },
  { phrase: "low sweetness", dimension: "sweetness", intent: "low" },
  { phrase: "sweet", dimension: "sweetness", intent: "high" },
  { phrase: "full body", dimension: "body", intent: "high" },
  { phrase: "heavy body", dimension: "body", intent: "high" },
  { phrase: "full-bodied", dimension: "body", intent: "high" },
  { phrase: "light body", dimension: "body", intent: "low" },
  { phrase: "thin", dimension: "body", intent: "low" },
  { phrase: "low bitterness", dimension: "bitterness", intent: "low" },
  { phrase: "smooth", dimension: "bitterness", intent: "low" },
  { phrase: "bitter", dimension: "bitterness", intent: "high" },
  { phrase: "floral", dimension: "floral", intent: "high" },
  { phrase: "fruity", dimension: "fruity", intent: "high" },
  { phrase: "chocolatey", dimension: "chocolate", intent: "high" },
  { phrase: "chocolaty", dimension: "chocolate", intent: "high" },
  { phrase: "chocolate", dimension: "chocolate", intent: "high" },
  { phrase: "nutty", dimension: "nutty", intent: "high" },
  { phrase: "spicy", dimension: "spice", intent: "high" },
  { phrase: "spiced", dimension: "spice", intent: "high" },
  { phrase: "funky", dimension: "fermented", intent: "high" },
  { phrase: "fermented", dimension: "fermented", intent: "high" },
  { phrase: "clean", dimension: "clarity", intent: "high" },
  { phrase: "clear cup", dimension: "clarity", intent: "high" },
  { phrase: "light roast", dimension: "roast", intent: "low" },
  { phrase: "dark roast", dimension: "roast", intent: "high" },
  { phrase: "strong", dimension: "brewRatio", intent: "low" },
  { phrase: "concentrated", dimension: "brewRatio", intent: "low" },
  { phrase: "weak", dimension: "brewRatio", intent: "high" },
  { phrase: "diluted", dimension: "brewRatio", intent: "high" },
  { phrase: "easy", dimension: "difficulty", intent: "low" },
  { phrase: "beginner", dimension: "difficulty", intent: "low" },
  { phrase: "simple", dimension: "difficulty", intent: "low" },
  { phrase: "advanced", dimension: "difficulty", intent: "high" },
  { phrase: "difficult", dimension: "difficulty", intent: "high" },
  { phrase: "hard to make", dimension: "difficulty", intent: "high" },
];

/** Known coffee processing methods the parser recognizes, matched as plain substrings. */
const KNOWN_PROCESSES = ["washed", "natural", "honey", "anaerobic", "carbonic maceration", "pulped natural"];

/** True if every significant (non-numeric) word of `name` appears somewhere in `query`. */
function nameWordsAppearIn(query: string, name: string): boolean {
  const words = name
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 1 && !/^\d+$/.test(word));
  if (words.length === 0) return false;
  return words.every((word) => query.includes(word));
}

function matchLookupNames(query: string, options: LookupOption[]): string[] {
  return options.filter((option) => nameWordsAppearIn(query, option.name)).map((option) => option.name);
}

/** Parses a free-text discovery query into structured filters against the given (DB-sourced) vocabulary. */
export function parseDiscoveryQuery(query: string, vocabulary: DiscoveryVocabulary): DiscoveryFilters {
  const normalized = query.toLowerCase();

  const originCountries = vocabulary.originCountries.filter((country) => {
    if (normalized.includes(country.toLowerCase())) return true;
    return Object.entries(ADJECTIVAL_ORIGIN_FORMS).some(
      ([adjective, canonical]) => canonical === country.toLowerCase() && normalized.includes(adjective),
    );
  });

  const processes = KNOWN_PROCESSES.filter((process) => normalized.includes(process)).filter((process) =>
    vocabulary.processes.some((known) => known.toLowerCase().includes(process)),
  );

  const roastLevels: ("Light" | "Medium" | "Dark")[] = [];
  if (/\blight\s*roast|light\s*roasted\b/.test(normalized)) roastLevels.push("Light");
  if (/\bmedium\s*roast/.test(normalized)) roastLevels.push("Medium");
  if (/\bdark\s*roast|dark\s*roasted\b/.test(normalized)) roastLevels.push("Dark");

  const brewingMethodNames = matchLookupNames(normalized, vocabulary.brewingMethods);
  const deviceNames = matchLookupNames(normalized, vocabulary.devices);
  const grinderNames = matchLookupNames(normalized, vocabulary.grinders);

  const xbloomDeviceName =
    vocabulary.xbloomDeviceNames
      .filter((name) => normalized.includes(name.toLowerCase()))
      .sort((a, b) => b.length - a.length)[0] ?? null;

  const sensory: Partial<Record<SensoryDimension, SensoryIntent>> = {};
  for (const { phrase, dimension, intent } of SENSORY_ADJECTIVES) {
    if (normalized.includes(phrase) && !(dimension in sensory)) {
      sensory[dimension] = intent;
    }
  }
  // A generic "low <dimension>" / "high <dimension>" phrasing not already
  // covered by a fixed phrase above (e.g. "low fermentation").
  for (const match of normalized.matchAll(/\b(low|high)\s+(\w+)/g)) {
    const [, intentWord, dimensionWord] = match;
    const dimension = (
      { acidity: "acidity", sweetness: "sweetness", body: "body", bitterness: "bitterness", fermentation: "fermented" } as Record<
        string,
        SensoryDimension
      >
    )[dimensionWord];
    if (dimension && !(dimension in sensory)) {
      sensory[dimension] = intentWord === "low" ? "low" : "high";
    }
  }

  return {
    originCountries,
    processes: [...new Set(processes)],
    roastLevels,
    brewingMethodNames,
    deviceNames,
    grinderNames,
    xbloomDeviceName,
    sensory,
  };
}

/** True if `intent` is satisfied by `value` (0-1), using a 0.6/0.4 high/low threshold with a neutral dead zone in between. */
function sensoryIntentMatches(value: number, intent: SensoryIntent): boolean {
  return intent === "high" ? value >= 0.6 : value <= 0.4;
}

export type DiscoveryCandidate = {
  recipeId: string;
  vector: SensoryVector;
  originCountry: string | null;
  process: string | null;
  roastLevel: string | null;
  brewingMethodName: string | null;
  deviceName: string | null;
  grinderName: string | null;
  xbloomDeviceModel: string | null;
};

/**
 * Scores one candidate recipe against parsed discovery filters. Returns
 * `null` if the query specified at least one filter and this candidate
 * matched none of them. A query with no recognized filters (couldn't be
 * parsed at all) matches everything with a neutral score, so an
 * unrecognized free-text query still returns *something* rather than an
 * empty result set.
 */
export function scoreDiscoveryMatch(
  filters: DiscoveryFilters,
  candidate: DiscoveryCandidate,
): { score: number; matchedOn: string[] } | null {
  const matchedOn: string[] = [];
  let totalCriteria = 0;

  if (filters.originCountries.length > 0) {
    totalCriteria += 1;
    if (candidate.originCountry && filters.originCountries.some((c) => c.toLowerCase() === candidate.originCountry?.toLowerCase())) {
      matchedOn.push(`Origin: ${candidate.originCountry}`);
    }
  }
  if (filters.processes.length > 0) {
    totalCriteria += 1;
    if (candidate.process && filters.processes.some((p) => candidate.process?.toLowerCase().includes(p))) {
      matchedOn.push(`Process: ${candidate.process}`);
    }
  }
  if (filters.roastLevels.length > 0) {
    totalCriteria += 1;
    if (candidate.roastLevel && filters.roastLevels.some((r) => candidate.roastLevel?.toLowerCase().includes(r.toLowerCase()))) {
      matchedOn.push(`Roast: ${candidate.roastLevel}`);
    }
  }
  if (filters.brewingMethodNames.length > 0) {
    totalCriteria += 1;
    if (candidate.brewingMethodName && filters.brewingMethodNames.includes(candidate.brewingMethodName)) {
      matchedOn.push(`Method: ${candidate.brewingMethodName}`);
    }
  }
  if (filters.deviceNames.length > 0) {
    totalCriteria += 1;
    if (candidate.deviceName && filters.deviceNames.includes(candidate.deviceName)) {
      matchedOn.push(`Brewer: ${candidate.deviceName}`);
    }
  }
  if (filters.grinderNames.length > 0) {
    totalCriteria += 1;
    if (candidate.grinderName && filters.grinderNames.includes(candidate.grinderName)) {
      matchedOn.push(`Grinder: ${candidate.grinderName}`);
    }
  }
  if (filters.xbloomDeviceName) {
    totalCriteria += 1;
    if (candidate.xbloomDeviceModel === filters.xbloomDeviceName) {
      matchedOn.push(`xBloom: ${candidate.xbloomDeviceModel}`);
    }
  }

  const sensoryEntries = Object.entries(filters.sensory) as [SensoryDimension, SensoryIntent][];
  for (const [dimension, intent] of sensoryEntries) {
    totalCriteria += 1;
    if (sensoryIntentMatches(candidate.vector[dimension], intent)) {
      matchedOn.push(`${intent === "high" ? "High" : "Low"} ${dimension}`);
    }
  }

  if (totalCriteria === 0) {
    return { score: 50, matchedOn: [] };
  }
  if (matchedOn.length === 0) {
    return null;
  }

  return { score: Math.round((matchedOn.length / totalCriteria) * 100), matchedOn };
}

/** Scores and ranks every candidate against a parsed query, highest match first, dropping non-matches. */
export function rankDiscoveryResults(
  filters: DiscoveryFilters,
  candidates: DiscoveryCandidate[],
  limit = 20,
): { recipeId: string; matchScore: number; matchedOn: string[] }[] {
  return candidates
    .map((candidate) => {
      const result = scoreDiscoveryMatch(filters, candidate);
      return result ? { recipeId: candidate.recipeId, matchScore: result.score, matchedOn: result.matchedOn } : null;
    })
    .filter((result): result is { recipeId: string; matchScore: number; matchedOn: string[] } => result !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
