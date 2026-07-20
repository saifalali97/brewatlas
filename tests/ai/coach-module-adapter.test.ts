import { describe, expect, it } from "vitest";
import { OpenAICoachModuleAdapter } from "@/lib/ai/coach-module-adapter";
import { CoachModuleNotConfiguredError } from "@/lib/ai/coach-module-errors";

describe("OpenAICoachModuleAdapter", () => {
  it("throws a friendly configuration error when the API key is missing", async () => {
    const adapter = new OpenAICoachModuleAdapter(null);

    await expect(
      adapter.chat({
        message: "Why is my coffee sour?",
        conversationId: "test",
        history: [],
      }),
    ).rejects.toThrow(CoachModuleNotConfiguredError);

    await expect(
      adapter.chat({
        message: "Why is my coffee sour?",
        conversationId: "test",
        history: [],
      }),
    ).rejects.toThrow(/OPENAI_API_KEY/);
  });
});
