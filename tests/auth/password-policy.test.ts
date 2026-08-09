import { describe, expect, it } from "vitest";
import { passwordSchema, validatePassword } from "@/lib/auth/password-policy";

describe("validatePassword", () => {
  it("accepts letter + number passwords of at least 8 characters", () => {
    for (const password of ["Coffee123", "Atlas2026", "brewatlas1"]) {
      expect(validatePassword(password)).toBeNull();
      expect(passwordSchema.safeParse(password).success).toBe(true);
    }
  });

  it("rejects passwords shorter than 8 characters", () => {
    expect(validatePassword("Abc1234")).toBe("too_short");
  });

  it("rejects passwords without a letter", () => {
    expect(validatePassword("12345678")).toBe("missing_letter");
  });

  it("rejects passwords without a number", () => {
    expect(validatePassword("Coffeeabc")).toBe("missing_digit");
  });

  it("allows optional uppercase and special characters", () => {
    expect(validatePassword("coffee1!")).toBeNull();
    expect(validatePassword("COFFEE12")).toBeNull();
  });

  it("rejects unchanged passwords when currentPassword is provided", () => {
    expect(validatePassword("Coffee123", { currentPassword: "Coffee123" })).toBe("same_as_current");
  });
});
