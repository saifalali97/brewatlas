import { describe, expect, it } from "vitest";
import { parseBrewDurationToIso } from "@/lib/seo/duration";

describe("parseBrewDurationToIso", () => {
  it("converts mm:ss brew times", () => {
    expect(parseBrewDurationToIso("3:30")).toBe("PT3M30S");
    expect(parseBrewDurationToIso("4:00")).toBe("PT4M");
  });

  it("converts seconds and hours", () => {
    expect(parseBrewDurationToIso("25 sec")).toBe("PT25S");
    expect(parseBrewDurationToIso("8 hr")).toBe("PT8H");
  });

  it("returns undefined for unsupported values", () => {
    expect(parseBrewDurationToIso(null)).toBeUndefined();
    expect(parseBrewDurationToIso("soon")).toBeUndefined();
  });
});
