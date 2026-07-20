import { describe, expect, it } from "vitest";
import { sanitizeEmail, sanitizePlainText } from "@/lib/security/sanitize";

describe("sanitizeEmail", () => {
  it("accepts valid emails and normalizes casing", () => {
    expect(sanitizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("rejects malformed or empty emails", () => {
    expect(sanitizeEmail("not-an-email")).toBeNull();
    expect(sanitizeEmail("")).toBeNull();
    expect(sanitizeEmail(null)).toBeNull();
  });
});

describe("sanitizePlainText", () => {
  it("strips HTML tags and control characters", () => {
    expect(sanitizePlainText("<b>hello</b>\u0000world")).toBe("helloworld");
  });

  it("enforces max length when provided", () => {
    expect(sanitizePlainText("abcdef", 3)).toBe("abc");
  });
});
