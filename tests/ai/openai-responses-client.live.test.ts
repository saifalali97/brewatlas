import { describe, expect, it } from "vitest";
import { buildCoachSystemPrompt, buildOpenAiInputMessages } from "@/lib/ai/coach-module-prompts";
import { OpenAiResponsesClient } from "@/lib/ai/openai-responses-client";

const hasLiveOpenAi =
  process.env.AI_COACH_MODULE_PROVIDER === "openai" && Boolean(process.env.OPENAI_API_KEY);

describe.runIf(hasLiveOpenAi)("OpenAiResponsesClient live", () => {
  it("returns assistant text from the Responses API", async () => {
    const client = new OpenAiResponsesClient({ apiKey: process.env.OPENAI_API_KEY!, timeoutMs: 30_000 });
    const text = await client.createResponse({
      model: client.model,
      instructions: buildCoachSystemPrompt(null, "chat"),
      input: buildOpenAiInputMessages([], "Reply with exactly: BrewAtlas coach online."),
    });

    expect(text.toLowerCase()).toContain("brewatlas");
  }, 45_000);
});
