import { describe, expect, it } from "vitest";
import { extractOutputText } from "@/lib/ai/openai-responses-client";

describe("extractOutputText", () => {
  it("reads top-level output_text", () => {
    expect(extractOutputText({ output_text: "Hello brewer" })).toBe("Hello brewer");
  });

  it("reads nested output message content", () => {
    expect(
      extractOutputText({
        output: [
          {
            type: "message",
            role: "assistant",
            content: [{ type: "output_text", text: "Try a finer grind." }],
          },
        ],
      }),
    ).toBe("Try a finer grind.");
  });

  it("returns empty string when no text is present", () => {
    expect(extractOutputText({ output: [] })).toBe("");
  });
});
