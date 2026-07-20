import { describe, expect, it } from "vitest";
import {
  ADMIN_PATH_PREFIX,
  isAdminApiPath,
  isAdminPath,
  isAccountPath,
  isOwnerDashboardPath,
  OWNER_DASHBOARD_PREFIX,
} from "@/lib/auth/permission-middleware";
import { isRbacAdminRole } from "@/types/auth";

describe("permission path helpers", () => {
  it("detects owner dashboard paths", () => {
    expect(isOwnerDashboardPath(OWNER_DASHBOARD_PREFIX)).toBe(true);
    expect(isOwnerDashboardPath(`${OWNER_DASHBOARD_PREFIX}/recipes`)).toBe(true);
    expect(isOwnerDashboardPath("/account")).toBe(false);
  });

  it("detects admin paths and APIs", () => {
    expect(isAdminPath(ADMIN_PATH_PREFIX)).toBe(true);
    expect(isAdminPath(`${ADMIN_PATH_PREFIX}/users`)).toBe(true);
    expect(isAdminApiPath("/api/admin/health")).toBe(true);
    expect(isAdminApiPath("/api/stripe/checkout")).toBe(false);
  });

  it("detects account paths", () => {
    expect(isAccountPath("/account")).toBe(true);
    expect(isAccountPath("/account/subscription")).toBe(true);
    expect(isAccountPath("/dashboard")).toBe(false);
  });
});

describe("isRbacAdminRole", () => {
  it("treats owner and admin as admin roles", () => {
    expect(isRbacAdminRole("owner")).toBe(true);
    expect(isRbacAdminRole("admin")).toBe(true);
  });

  it("rejects non-admin roles", () => {
    expect(isRbacAdminRole("editor")).toBe(false);
    expect(isRbacAdminRole("user")).toBe(false);
    expect(isRbacAdminRole(null)).toBe(false);
  });
});
