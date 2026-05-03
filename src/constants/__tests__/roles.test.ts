import { describe, expect, it } from "vitest";
import { canAccessRoute, hasPermission, PERMISSIONS } from "../roles";

describe("role permissions", () => {
  it("does not allow employees to access user administration", () => {
    expect(hasPermission("EMPLOYEE", PERMISSIONS.userView)).toBe(false);
    expect(canAccessRoute("EMPLOYEE", "/users")).toBe(false);
  });

  it("allows managers to view reports but not assign roles", () => {
    expect(hasPermission("MANAGER", PERMISSIONS.reportView)).toBe(true);
    expect(hasPermission("MANAGER", PERMISSIONS.roleAssign)).toBe(false);
  });

  it("allows admins to view audit logs", () => {
    expect(canAccessRoute("ADMIN", "/audit-logs")).toBe(true);
  });
});
