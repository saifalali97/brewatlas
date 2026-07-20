import type { AiCoachMessage, AiCoachMode, AiCoachPreferences } from "@/types/ai-coach-module";

export type OpenAiResponseInputMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const BASE_SYSTEM_PROMPT = `You are **BrewAtlas AI Coach**, a practical specialty-coffee brewing assistant.

Your role:
- Help home brewers with extraction, grind, ratio, temperature, bloom, and troubleshooting
- Explain concepts clearly without hype or competition-recipe name-dropping
- Give actionable, step-by-step guidance — change one variable at a time when dialing in
- Say when you are uncertain rather than inventing facts

Output rules:
- Use **Markdown** for structure (headings, lists, tables when helpful)
- Keep answers focused and scannable
- Prefer practical starting points over overly precise numbers unless the user provides their setup
- Do not mention being an AI unless asked
- Do not provide medical, legal, or financial advice`;

function formatPreferencesBlock(preferences: AiCoachPreferences | null): string {
  if (!preferences) return "";
  const lines: string[] = [];
  if (preferences.experienceLevel) lines.push(`Experience: ${preferences.experienceLevel}`);
  if (preferences.favoriteBrewer) lines.push(`Preferred brewer: ${preferences.favoriteBrewer}`);
  if (preferences.favoriteGrinder) lines.push(`Preferred grinder: ${preferences.favoriteGrinder}`);
  if (preferences.favoriteRoast) lines.push(`Preferred roast: ${preferences.favoriteRoast}`);
  if (preferences.favoriteOrigin) lines.push(`Preferred origin: ${preferences.favoriteOrigin}`);
  if (preferences.favoriteRatio) lines.push(`Preferred ratio: ${preferences.favoriteRatio}`);
  if (lines.length === 0) return "";
  return `\n\nUser preferences:\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

function modeHint(mode: AiCoachMode | undefined): string {
  switch (mode) {
    case "brew_doctor":
      return "\n\nThe user is in Brew Doctor mode — prioritize symptom diagnosis and concrete fixes.";
    case "guided_brew":
      return "\n\nThe user is in Guided Brew mode — recommend parameters and explain why they work.";
    case "recipe_generator":
      return "\n\nThe user wants a recipe — include dose, water, ratio, temperature, grind, steps, and adjustments.";
    case "knowledge":
      return "\n\nThe user wants educational coffee knowledge — explain concepts clearly.";
    case "analyzer":
      return "\n\nThe user wants session analysis — comment on extraction, strength, and balance.";
    default:
      return "";
  }
}

/** System prompt for OpenAI Responses API `instructions` field. */
export function buildCoachSystemPrompt(
  preferences: AiCoachPreferences | null,
  mode: AiCoachMode = "chat",
): string {
  return BASE_SYSTEM_PROMPT + formatPreferencesBlock(preferences) + modeHint(mode);
}

/** Map BrewAtlas conversation history to OpenAI Responses `input` messages. */
export function buildOpenAiInputMessages(
  history: AiCoachMessage[],
  currentMessage: string,
): OpenAiResponseInputMessage[] {
  const messages: OpenAiResponseInputMessage[] = [];

  for (const entry of history) {
    if (entry.role === "system") continue;
    if (!entry.content.trim()) continue;
    messages.push({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content,
    });
  }

  const trimmed = currentMessage.trim();
  if (trimmed) {
    const last = messages.at(-1);
    if (!last || last.role !== "user" || last.content !== trimmed) {
      messages.push({ role: "user", content: trimmed });
    }
  }

  return messages;
}
