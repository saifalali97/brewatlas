import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within the configured window", () => {
    const config = { namespace: "test-allow", limit: 2, windowMs: 60_000 };
    const first = checkRateLimit("client-a", config);
    const second = checkRateLimit("client-a", config);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
  });

  it("blocks requests after the limit is exceeded", () => {
    const config = { namespace: "test-block", limit: 1, windowMs: 60_000 };
    checkRateLimit("client-b", config);
    const blocked = checkRateLimit("client-b", config);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("tracks namespaces independently", () => {
    const first = checkRateLimit("shared-ip", RATE_LIMITS.contactForm);
    const second = checkRateLimit("shared-ip", RATE_LIMITS.apiRoute);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers x-forwarded-for", () => {
    const request = new Request("https://brewatlas.app", {
      headers: { "x-forwarded-for": "203.0.113.1, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const request = new Request("https://brewatlas.app", {
      headers: { "x-real-ip": "198.51.100.4" },
    });
    expect(getClientIp(request)).toBe("198.51.100.4");
  });
});
