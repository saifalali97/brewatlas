import { describe, expect, it } from "vitest";
import { roleCanAccessDashboard, roleHasPermission } from "@/lib/auth/permissions";

describe("roleHasPermission", () => {
  it("denies regular users every CMS permission", () => {
    expect(roleHasPermission("user", "cms.access")).toBe(false);
    expect(roleHasPermission("user", "cms.settings")).toBe(false);
  });

  it("grants owner and admin CMS access", () => {
    expect(roleHasPermission("owner", "cms.access")).toBe(true);
    expect(roleHasPermission("admin", "cms.access")).toBe(true);
  });

  it("denies editor-only roles from subscription management", () => {
    expect(roleHasPermission("editor", "cms.subscriptions")).toBe(false);
    expect(roleHasPermission("writer", "cms.subscriptions")).toBe(false);
  });
});

describe("roleCanAccessDashboard", () => {
  it("allows owner and admin into the dashboard", () => {
    expect(roleCanAccessDashboard("owner")).toBe(true);
    expect(roleCanAccessDashboard("admin")).toBe(true);
  });

  it("blocks non-dashboard roles", () => {
    expect(roleCanAccessDashboard("editor")).toBe(false);
    expect(roleCanAccessDashboard("user")).toBe(false);
  });
});
