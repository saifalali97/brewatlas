import { afterEach, describe, expect, it } from "vitest";
import { getAllowedOrigins, verifySameOriginHeaders } from "@/lib/security/csrf";

describe("verifySameOriginHeaders", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (originalSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    }
  });

  it("accepts requests from the configured site origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://brewatlas.app";
    expect(verifySameOriginHeaders("https://brewatlas.app", null)).toBe(true);
  });

  it("accepts requests when referer matches the site origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://brewatlas.app";
    expect(verifySameOriginHeaders(null, "https://brewatlas.app/contact")).toBe(true);
  });

  it("rejects requests from unknown origins", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://brewatlas.app";
    expect(verifySameOriginHeaders("https://evil.example", null)).toBe(false);
  });

  it("rejects requests without origin or referer", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://brewatlas.app";
    expect(verifySameOriginHeaders(null, null)).toBe(false);
  });

  it("includes localhost origins in non-production", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://brewatlas.app";
    const origins = getAllowedOrigins();
    expect(origins.has("http://localhost:3000")).toBe(process.env.NODE_ENV !== "production");
  });
});
